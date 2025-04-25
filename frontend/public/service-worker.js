// Service Worker cho ứng dụng đọc truyện
const CACHE_NAME = 'manga-reader-cache-v1';
const MANGA_CACHE_NAME = 'manga-images-cache-v1';

// Các tài nguyên cần cache khi cài đặt service worker
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/images/default-manga-cover.svg',
  '/manifest.json',
  '/favicon.ico'
];

// Cài đặt service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Kích hoạt service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  // Xóa các cache cũ
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== MANGA_CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Xử lý các request
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Xử lý cache cho hình ảnh manga
  if (
    (requestUrl.pathname.includes('/data/manga/') &&
    (requestUrl.pathname.endsWith('.jpg') ||
     requestUrl.pathname.endsWith('.jpeg') ||
     requestUrl.pathname.endsWith('.png') ||
     requestUrl.pathname.endsWith('.webp') ||
     requestUrl.pathname.endsWith('.gif')))
  ) {
    event.respondWith(cacheFirst(event.request));
  }
  // Xử lý cache cho các tài nguyên tĩnh khác
  else if (STATIC_ASSETS.includes(requestUrl.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
  // Các request khác sử dụng network first
  else {
    event.respondWith(networkFirst(event.request));
  }
});

// Chiến lược Cache First: Ưu tiên lấy từ cache, nếu không có thì lấy từ mạng
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    // Chỉ cache các response thành công (status 200)
    if (networkResponse.status === 200) {
      const cache = await caches.open(
        request.url.includes('/data/manga/') ? MANGA_CACHE_NAME : CACHE_NAME
      );
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Fetch failed', error);
    // Có thể trả về một hình ảnh mặc định nếu là request hình ảnh
    if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return caches.match('/images/default-manga-cover.svg');
    }
    throw error;
  }
}

// Chiến lược Network First: Ưu tiên lấy từ mạng, nếu không được thì lấy từ cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    // Cache lại response
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Fallback to cache', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Nếu là request HTML, trả về trang offline
    if (request.headers.get('Accept').includes('text/html')) {
      return caches.match('/');
    }

    throw error;
  }
}

// Xử lý tin nhắn từ client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_MANGA_IMAGES') {
    const { urls } = event.data;
    if (Array.isArray(urls) && urls.length > 0) {
      console.log('Service Worker: Caching manga images', urls.length);
      caches.open(MANGA_CACHE_NAME).then((cache) => {
        // Chỉ tải 5 hình ảnh cùng lúc để tránh quá tải
        const batchSize = 5;
        const batches = [];

        // Chia thành các nhóm nhỏ
        for (let i = 0; i < urls.length; i += batchSize) {
          batches.push(urls.slice(i, i + batchSize));
        }

        // Xử lý từng nhóm tuần tự
        return batches.reduce((promise, batch) => {
          return promise.then(() => {
            return Promise.all(
              batch.map((url) => {
                // Kiểm tra xem URL đã được cache chưa
                return cache.match(url).then(cachedResponse => {
                  if (cachedResponse) {
                    console.log('Image already cached:', url);
                    return Promise.resolve();
                  }

                  console.log('Caching image:', url);
                  return fetch(url)
                    .then((response) => {
                      if (response.status === 200) {
                        return cache.put(url, response);
                      }
                    })
                    .catch((error) => {
                      console.error('Failed to cache:', url, error);
                    });
                });
              })
            );
          });
        }, Promise.resolve());
      });
    }
  } else if (event.data && event.data.type === 'CACHE_MANGA_IMAGE') {
    // Cache một hình ảnh manga
    if (event.data.url) {
      console.log('Service Worker: Caching single manga image', event.data.url);
      caches.open(MANGA_CACHE_NAME).then((cache) => {
        // Kiểm tra xem URL đã được cache chưa
        cache.match(event.data.url).then(cachedResponse => {
          if (cachedResponse) {
            console.log('Image already cached:', event.data.url);
            return;
          }

          fetch(event.data.url)
            .then((response) => {
              if (response.status === 200) {
                return cache.put(event.data.url, response);
              }
            })
            .catch((error) => {
              console.error('Failed to cache:', event.data.url, error);
            });
        });
      });
    }
  }
});
