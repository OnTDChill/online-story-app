const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/';
const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log(...args);

// Cache settings
const CACHE_DURATION = {
  DIRECTORIES: 86400000, // 24 hours
  MANGA_INFO: 3600000,   // 1 hour
  CHAPTERS: 1800000,     // 30 minutes
  CHAPTER_CONTENT: 600000 // 10 minutes
};

// Cache helpers
const getCache = (key) => {
  try {
    // Xóa cache cho Cưa Thủ để áp dụng các thay đổi mới
    if (key.includes('cưa_thủ') || key.includes('cua_thu')) {
      return null;
    }

    const cached = localStorage.getItem(key);
    const timestamp = localStorage.getItem(`${key}_timestamp`);

    if (cached && timestamp) {
      const now = Date.now();
      const cacheTime = parseInt(timestamp);
      const cacheAge = now - cacheTime;
      const maxAge = key.includes('chapter_content') ? CACHE_DURATION.CHAPTER_CONTENT :
                    key.includes('chapters_') ? CACHE_DURATION.CHAPTERS :
                    key.includes('manga_') ? CACHE_DURATION.MANGA_INFO :
                    CACHE_DURATION.DIRECTORIES;

      if (cacheAge < maxAge) {
        return JSON.parse(cached);
      }
    }
    return null;
  } catch (error) {
    log('Error reading from cache:', error);
    return null;
  }
};

const setCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_timestamp`, Date.now().toString());
  } catch (error) {
    log('Error writing to cache:', error);
  }
};

// Xóa cache cho một manga cụ thể
const clearMangaCache = (mangaId) => {
  try {
    log(`Clearing cache for manga: ${mangaId}`);
    // Xóa tất cả các key trong localStorage có chứa mangaId
    Object.keys(localStorage).forEach(key => {
      if (key.includes(mangaId)) {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
        log(`Removed cache: ${key}`);
      }
    });
  } catch (error) {
    log('Error clearing cache:', error);
  }
};

// Tự động xóa cache cho truyện Cưa Thủ khi trang được tải
(function clearCuaThuCache() {
  try {
    // Xóa cache cho các biến thể tên truyện Cưa Thủ
    ['cưa_thủ', 'cua_thu'].forEach(id => {
      clearMangaCache(id);
    });
    log('Cleared cache for Cưa Thủ manga');
  } catch (error) {
    log('Error clearing Cưa Thủ cache:', error);
  }
})();

export const MangaService = {
  // Xóa cache cho một manga cụ thể
  clearCache(mangaId) {
    clearMangaCache(mangaId);
  },
  // Lấy danh sách truyện
  async getMangas() {
    try {
      log('Fetching manga list...');
      const directories = await this.scanMangaDirectories();
      const mangaPromises = directories.map(async dir => {
        try {
          const info = await fetch(`/data/manga/${dir}/info.json`);
          if (info.ok) {
            const mangaInfo = await info.json();
            return { ...mangaInfo, _id: mangaInfo._id || dir };
          }

          let thumbnail = null;
          const coverFormats = ['png', 'jpg'];
          for (const format of coverFormats) {
            const coverResponse = await fetch(`/data/manga/${dir}/cover.${format}`, { method: 'HEAD' });
            if (coverResponse.ok) {
              thumbnail = `/data/manga/${dir}/cover.${format}`;
              break;
            }
          }

          return {
            _id: dir,
            title: dir.charAt(0).toUpperCase() + dir.slice(1).replace(/_/g, ' '),
            thumbnail: thumbnail || '/placeholder-image.jpg',
            genre: 'Manga',
            genres: ['Manga'],
            status: 'Đang tiến hành',
            description: `Truyện ${dir.replace(/_/g, ' ')}`,
            chapters: 1
          };
        } catch (error) {
          log(`Error loading manga from ${dir}:`, error);
          return null;
        }
      });

      const mangas = (await Promise.all(mangaPromises)).filter(manga => manga !== null);

      const processedMangas = mangas.map(manga => ({
        ...manga,
        _id: manga._id || `manga-${Math.random().toString(36).substring(2, 11)}`,
        title: manga.title || 'Untitled Manga',
        author: manga.author || 'Unknown Author',
        thumbnail: manga.thumbnail || '/placeholder-image.jpg',
        genre: manga.genre || (manga.genres?.[0] || 'Manga'),
        status: manga.status || 'Đang tiến hành',
        views: manga.views || 0,
        rating: manga.rating || 5.0,
        chapters: manga.chapters || 1
      }));

      log('Total mangas loaded:', processedMangas.length);
      return processedMangas;
    } catch (error) {
      log('Error fetching mangas:', error);
      return [];
    }
  },

  // Quét tất cả các thư mục trong /data/manga/
  async scanMangaDirectories() {
    // Kiểm tra cache
    const cachedDirs = getCache('mangaDirectories');
    if (cachedDirs) {
      log('Using cached manga directories');
      return cachedDirs;
    }

    // Thử lấy từ API
    try {
      log('Fetching manga directories from API...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 giây timeout

      const dirResponse = await fetch(`${API_URL}manga-directories`, {
        signal: controller.signal
      }).catch(() => ({ ok: false }));

      clearTimeout(timeoutId);

      if (dirResponse.ok) {
        const directories = await dirResponse.json();
        setCache('mangaDirectories', directories);
        return directories;
      }
    } catch (error) {
      log('Error fetching manga directories from API:', error);
    }

    // Thử lấy từ index.json
    try {
      log('Fetching manga directories from index.json...');
      const indexResponse = await fetch('/data/manga/index.json')
        .catch(() => ({ ok: false }));

      if (indexResponse.ok) {
        const data = await indexResponse.json();
        const directories = data.directories || [];
        if (Array.isArray(directories) && directories.length > 0) {
          setCache('mangaDirectories', directories);
          return directories;
        }
      }
    } catch (error) {
      log('No index.json found or error reading it');
    }

    // Danh sách các thư mục manga phổ biến
    const possibleDirs = [
      'doraemon', 'cưa_thủ', 'naruto', 'one-piece', 'dragon-ball', 'bleach',
      'attack_on_titan', 'my_hero_academia', 'demon_slayer', 'jujutsu_kaisen',
      'chainsaw_man', 'spy_x_family', 'tokyo_revengers', 'black_clover',
      'hunter_x_hunter', 'fairy_tail', 'fullmetal_alchemist'
    ];

    log('Checking for known manga directories...');

    // Tạo các promise để kiểm tra song song
    const checkPromises = possibleDirs.map(async dir => {
      try {
        // Kiểm tra nhanh bằng HEAD request
        const infoResponse = await fetch(`/data/manga/${dir}/info.json`, {
          method: 'HEAD',
          cache: 'no-store'
        }).catch(() => ({ ok: false }));

        return infoResponse.ok ? dir : null;
      } catch {
        return null;
      }
    });

    // Chờ tất cả các promise hoàn thành
    const validDirs = (await Promise.all(checkPromises)).filter(dir => dir);
    const uniqueDirs = [...new Set(validDirs)];

    // Lưu kết quả vào cache
    if (uniqueDirs.length > 0) {
      setCache('mangaDirectories', uniqueDirs);
    }

    return uniqueDirs;
  },

  // Lấy thông tin chi tiết truyện
  async getManga(id) {
    try {
      // Kiểm tra cache
      const cacheKey = `manga_${id}`;
      const cachedManga = getCache(cacheKey);
      if (cachedManga) {
        log(`Using cached manga info for ${id}`);
        return cachedManga;
      }

      log(`Fetching manga details for ID: ${id}`);

      // Thử lấy từ local info.json
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const info = await fetch(`/data/manga/${id}/info.json`, {
          signal: controller.signal,
          cache: 'no-store'
        }).catch(() => ({ ok: false }));

        clearTimeout(timeoutId);

        if (info.ok) {
          const mangaInfo = await info.json();
          // Thêm các trường bắt buộc nếu thiếu
          const processedInfo = {
            ...mangaInfo,
            _id: mangaInfo._id || id,
            title: mangaInfo.title || id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '),
            author: mangaInfo.author || 'Unknown',
            thumbnail: mangaInfo.thumbnail || `/data/manga/${id}/cover.jpg`,
            genre: mangaInfo.genre || 'Manga',
            status: mangaInfo.status || 'Đang tiến hành'
          };

          // Lưu vào cache
          setCache(cacheKey, processedInfo);
          return processedInfo;
        }
      } catch (error) {
        log(`Error loading manga info from local: ${id}`, error);
      }

      // Thử lấy từ API
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_URL}stories/${id}`, {
          signal: controller.signal
        }).catch(() => ({ ok: false }));

        clearTimeout(timeoutId);

        if (response.ok) {
          const apiData = await response.json();
          setCache(cacheKey, apiData);
          return apiData;
        }
      } catch (error) {
        log(`Error loading manga from API: ${id}`, error);
      }

      // Tạo thông tin cơ bản nếu không tìm thấy
      const basicInfo = {
        _id: id,
        title: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '),
        author: 'Unknown Author',
        thumbnail: `/data/manga/${id}/cover.jpg`,
        genre: 'Manga',
        genres: ['Manga'],
        status: 'Đang tiến hành',
        description: `Truyện ${id.replace(/_/g, ' ')}`,
        chapters: 0
      };

      // Kiểm tra xem có ảnh bìa không
      try {
        const coverFormats = ['jpg', 'png', 'jpeg', 'webp'];
        for (const format of coverFormats) {
          const coverResponse = await fetch(`/data/manga/${id}/cover.${format}`, {
            method: 'HEAD',
            cache: 'no-store'
          }).catch(() => ({ ok: false }));

          if (coverResponse.ok) {
            basicInfo.thumbnail = `/data/manga/${id}/cover.${format}`;
            break;
          }
        }
      } catch (error) {
        // Bỏ qua lỗi khi kiểm tra ảnh bìa
      }

      return basicInfo;
    } catch (error) {
      log(`Error fetching manga ${id}:`, error);
      return null;
    }
  },

  // Lấy danh sách chương của truyện
  async getChapters(id) {
    try {
      // Kiểm tra cache
      const cacheKey = `chapters_${id}`;
      const cachedChapters = getCache(cacheKey);
      if (cachedChapters) {
        log(`Using cached chapters for ${id}`);
        return cachedChapters;
      }

      log(`Fetching chapters for manga ID: ${id}`);

      // Xử lý đặc biệt cho Doraemon (PDF)
      if (id === 'doraemon') {
        log('Special handling for Doraemon chapters (PDF)');

        // Tối ưu: Kiểm tra các file PDF theo nhóm
        const pdfFormats = [
          { pattern: 'doraemon-vol-*.pdf', prefix: 'doraemon-vol-' },
          { pattern: 'vol-*.pdf', prefix: 'vol-' },
          { pattern: '*.pdf', prefix: '' }
        ];

        // Tạo các nhóm kiểm tra để giảm số lượng request
        const chapterGroups = [
          { start: 1, end: 15 },   // Nhóm 1: Tập 1-15
          { start: 16, end: 30 },  // Nhóm 2: Tập 16-30
          { start: 31, end: 45 }   // Nhóm 3: Tập 31-45
        ];

        const chapters = [];

        // Kiểm tra từng nhóm
        for (const group of chapterGroups) {
          const chapterPromises = Array.from(
            { length: group.end - group.start + 1 },
            (_, i) => group.start + i
          ).map(async i => {
            for (const format of pdfFormats) {
              const fileName = `${format.prefix}${i}.pdf`;
              const pdfPath = `/data/manga/${id}/${fileName}`;
              try {
                const response = await fetch(pdfPath, {
                  method: 'HEAD',
                  cache: 'no-store'
                }).catch(() => ({ ok: false }));

                if (response.ok) {
                  return {
                    id: i.toString(),
                    _id: `${id}-chapter-${i}`,
                    number: i,
                    title: `Tập ${i}`,
                    mangaId: id,
                    url: pdfPath,
                    type: 'pdf',
                    date: new Date(Date.now() - (45 - i) * 30 * 24 * 60 * 60 * 1000).toISOString()
                  };
                }
              } catch {
                // Bỏ qua lỗi
              }
            }
            return null;
          });

          // Chờ tất cả các promise trong nhóm hoàn thành
          const groupChapters = (await Promise.all(chapterPromises)).filter(ch => ch);
          chapters.push(...groupChapters);

          // Nếu tìm thấy ít nhất 5 chapter, dừng tìm kiếm
          if (chapters.length >= 5) break;
        }

        if (chapters.length > 0) {
          // Sắp xếp theo số tập
          const sortedChapters = chapters.sort((a, b) => a.number - b.number);
          setCache(cacheKey, sortedChapters);
          return sortedChapters;
        }

        // Nếu không tìm thấy, tạo danh sách mặc định
        const defaultChapters = Array.from({ length: 5 }, (_, i) => ({
          id: (i + 1).toString(),
          _id: `${id}-chapter-${i + 1}`,
          number: i + 1,
          title: `Tập ${i + 1}`,
          mangaId: id,
          type: 'pdf',
          date: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));

        setCache(cacheKey, defaultChapters);
        return defaultChapters;
      }

      // Xử lý đặc biệt cho Cưa Thủ (hình ảnh)
      if (id === 'cưa_thủ') {
        log('Special handling for Cưa Thủ chapters (images)');

        // Kiểm tra nhanh xem có chapters.json không
        try {
          const chaptersJsonResponse = await fetch(`/data/manga/${id}/chapters.json`, {
            method: 'HEAD',
            cache: 'no-store'
          }).catch(() => ({ ok: false }));

          if (chaptersJsonResponse.ok) {
            const chaptersData = await (await fetch(`/data/manga/${id}/chapters.json`)).json();
            const processedChapters = chaptersData.map(chapter => ({
              ...chapter,
              id: chapter.id || `${id}-chapter-${chapter.number}`,
              _id: chapter._id || `${id}-chapter-${chapter.number}`,
              number: chapter.number || parseInt(chapter.id) || 0,
              title: chapter.title || `Chương ${chapter.number}`,
              mangaId: id,
              type: 'images',
              date: chapter.date || new Date().toISOString()
            }));

            setCache(cacheKey, processedChapters);
            return processedChapters;
          }
        } catch (error) {
          log('Error checking chapters.json for Cưa Thủ', error);
        }

        // Kiểm tra các thư mục chapter
        const chapterPromises = Array.from({ length: 10 }, (_, i) => i + 1).map(async i => {
          const chapterPath = `/data/manga/${id}/chapters/${i}`;

          // Kiểm tra các đường dẫn phổ biến
          const testPaths = [
            `${chapterPath}/index.json`,
            `${chapterPath}/001.jpg`,
            `${chapterPath}/pages_001_100/001.jpg`
          ];

          // Kiểm tra song song các đường dẫn
          const pathChecks = testPaths.map(path =>
            fetch(path, { method: 'HEAD', cache: 'no-store' })
              .then(res => res.ok ? path : null)
              .catch(() => null)
          );

          const validPath = (await Promise.all(pathChecks)).find(path => path);

          if (validPath) {
            return {
              id: i.toString(),
              _id: `${id}-chapter-${i}`,
              number: i,
              title: `Chương ${i}`,
              mangaId: id,
              type: 'images',
              date: new Date(Date.now() - (10 - i) * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
          }

          return null;
        });

        const chapters = (await Promise.all(chapterPromises)).filter(ch => ch);
        if (chapters.length > 0) {
          setCache(cacheKey, chapters);
          return chapters;
        }

        // Nếu không tìm thấy, tạo chapter mặc định
        const defaultChapter = [{
          id: '1',
          _id: `${id}-chapter-1`,
          number: 1,
          title: 'Chương 1',
          mangaId: id,
          type: 'images',
          date: new Date().toISOString()
        }];

        setCache(cacheKey, defaultChapter);
        return defaultChapter;
      }

      // Thử lấy từ chapters.json
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const chapters = await fetch(`/data/manga/${id}/chapters.json`, {
          signal: controller.signal,
          cache: 'no-store'
        }).catch(() => ({ ok: false }));

        clearTimeout(timeoutId);

        if (chapters.ok) {
          const chaptersData = await chapters.json();
          const processedChapters = chaptersData.map(chapter => ({
            ...chapter,
            id: chapter.id || `${id}-chapter-${chapter.number}`,
            _id: chapter._id || `${id}-chapter-${chapter.number}`,
            number: chapter.number || parseInt(chapter.id) || 0,
            title: chapter.title || `Chương ${chapter.number}`,
            mangaId: id,
            date: chapter.date || new Date().toISOString(),
            images: chapter.images?.map(img =>
              img.startsWith('http') || img.startsWith('/')
                ? img
                : `/data/manga/${id}/chapters/${chapter.number}/${img}`
            ),
            url: chapter.url?.startsWith('http') || chapter.url?.startsWith('/')
              ? chapter.url
              : `/data/manga/${id}/${chapter.url}`
          }));

          setCache(cacheKey, processedChapters);
          return processedChapters;
        }
      } catch (error) {
        log(`Error loading chapters from local: ${id}`, error);
      }

      // Thử quét các file PDF
      const pdfChapters = await this.scanPdfChapters(id);
      if (pdfChapters.length > 0) {
        setCache(cacheKey, pdfChapters);
        return pdfChapters;
      }

      // Thử quét các thư mục chứa ảnh
      const imageChapters = await this.scanImageChapters(id);
      if (imageChapters.length > 0) {
        setCache(cacheKey, imageChapters);
        return imageChapters;
      }

      // Không tìm thấy chapter nào
      return [];
    } catch (error) {
      log(`Error fetching chapters for manga ${id}:`, error);
      return [];
    }
  },

  // Helper: Quét các file PDF
  async scanPdfChapters(id) {
    // Kiểm tra cache
    const cacheKey = `pdf_chapters_${id}`;
    const cachedChapters = getCache(cacheKey);
    if (cachedChapters) {
      log(`Using cached PDF chapters for ${id}`);
      return cachedChapters;
    }

    // Các định dạng tên file PDF phổ biến
    const pdfFormats = ['Vol', 'vol', 'chapter', ''];

    // Tạo các nhóm kiểm tra để giảm số lượng request
    const chapterGroups = [
      { start: 1, end: 7 },    // Nhóm 1: Tập 1-7
      { start: 8, end: 14 },   // Nhóm 2: Tập 8-14
      { start: 15, end: 20 }   // Nhóm 3: Tập 15-20
    ];

    const chapters = [];

    // Kiểm tra từng nhóm
    for (const group of chapterGroups) {
      // Tạo các promise để kiểm tra song song
      const chapterPromises = Array.from(
        { length: group.end - group.start + 1 },
        (_, i) => group.start + i
      ).map(async i => {
        // Kiểm tra các định dạng tên file
        for (const prefix of pdfFormats) {
          const fileName = `${prefix}${i}.pdf`;
          const pdfPath = `/data/manga/${id}/${fileName}`;
          try {
            const response = await fetch(pdfPath, {
              method: 'HEAD',
              cache: 'no-store'
            }).catch(() => ({ ok: false }));

            if (response.ok) {
              return {
                id: i.toString(),
                _id: `${id}-chapter-${i}`,
                number: i,
                title: `Tập ${i}`,
                mangaId: id,
                url: pdfPath,
                type: 'pdf',
                date: new Date().toISOString()
              };
            }
          } catch {
            // Bỏ qua lỗi
          }
        }
        return null;
      });

      // Chờ tất cả các promise trong nhóm hoàn thành
      const groupChapters = (await Promise.all(chapterPromises)).filter(ch => ch);
      chapters.push(...groupChapters);

      // Nếu tìm thấy ít nhất 3 chapter, dừng tìm kiếm
      if (chapters.length >= 3) break;
    }

    // Sắp xếp theo số tập
    const sortedChapters = chapters.sort((a, b) => a.number - b.number);

    // Lưu vào cache
    if (sortedChapters.length > 0) {
      setCache(cacheKey, sortedChapters);
    }

    return sortedChapters;
  },

  // Helper: Quét các thư mục chứa ảnh
  async scanImageChapters(id) {
    // Kiểm tra cache
    const cacheKey = `image_chapters_${id}`;
    const cachedChapters = getCache(cacheKey);
    if (cachedChapters) {
      log(`Using cached image chapters for ${id}`);
      return cachedChapters;
    }

    // Tạo các nhóm kiểm tra để giảm số lượng request
    const chapterGroups = [
      { start: 1, end: 7 },    // Nhóm 1: Chương 1-7
      { start: 8, end: 14 },   // Nhóm 2: Chương 8-14
      { start: 15, end: 20 }   // Nhóm 3: Chương 15-20
    ];

    const chapters = [];

    // Kiểm tra từng nhóm
    for (const group of chapterGroups) {
      // Tạo các promise để kiểm tra song song
      const chapterPromises = Array.from(
        { length: group.end - group.start + 1 },
        (_, i) => group.start + i
      ).map(async i => {
        const chapterPath = `/data/manga/${id}/chapters/${i}`;

        // Kiểm tra nhanh xem có index.json không
        try {
          const indexResponse = await fetch(`${chapterPath}/index.json`, {
            method: 'HEAD',
            cache: 'no-store'
          }).catch(() => ({ ok: false }));

          if (indexResponse.ok) {
            return {
              id: i.toString(),
              _id: `${id}-chapter-${i}`,
              number: i,
              title: `Chương ${i}`,
              mangaId: id,
              type: 'images',
              hasIndex: true,
              indexPath: `${chapterPath}/index.json`,
              date: new Date().toISOString()
            };
          }
        } catch {
          // Bỏ qua lỗi
        }

        // Kiểm tra các định dạng ảnh phổ biến
        const imageFormats = ['jpg', 'png', 'webp'];
        for (const format of imageFormats) {
          // Chỉ kiểm tra ảnh đầu tiên để xác định định dạng
          try {
            const firstImagePath = `${chapterPath}/001.${format}`;
            const response = await fetch(firstImagePath, {
              method: 'HEAD',
              cache: 'no-store'
            }).catch(() => ({ ok: false }));

            if (response.ok) {
              // Nếu tìm thấy ảnh đầu tiên, giả định có 10 ảnh đầu tiên
              // Thực tế sẽ tải thêm khi người dùng xem chapter
              const images = Array.from({ length: 10 }, (_, j) =>
                `${chapterPath}/${(j + 1).toString().padStart(3, '0')}.${format}`
              );

              return {
                id: i.toString(),
                _id: `${id}-chapter-${i}`,
                number: i,
                title: `Chương ${i}`,
                mangaId: id,
                images,
                type: 'images',
                imageFormat: format,
                basePath: chapterPath,
                date: new Date().toISOString()
              };
            }
          } catch {
            // Bỏ qua lỗi
          }
        }

        // Kiểm tra cấu trúc thư mục con (pages_001_100)
        try {
          const subdirPath = `${chapterPath}/pages_001_100/001.jpg`;
          const response = await fetch(subdirPath, {
            method: 'HEAD',
            cache: 'no-store'
          }).catch(() => ({ ok: false }));

          if (response.ok) {
            // Nếu tìm thấy, giả định có 10 ảnh đầu tiên
            const images = Array.from({ length: 10 }, (_, j) =>
              `${chapterPath}/pages_001_100/${(j + 1).toString().padStart(3, '0')}.jpg`
            );

            return {
              id: i.toString(),
              _id: `${id}-chapter-${i}`,
              number: i,
              title: `Chương ${i}`,
              mangaId: id,
              images,
              type: 'images',
              hasSubdirs: true,
              basePath: chapterPath,
              date: new Date().toISOString()
            };
          }
        } catch {
          // Bỏ qua lỗi
        }

        return null;
      });

      // Chờ tất cả các promise trong nhóm hoàn thành
      const groupChapters = (await Promise.all(chapterPromises)).filter(ch => ch);
      chapters.push(...groupChapters);

      // Nếu tìm thấy ít nhất 3 chapter, dừng tìm kiếm
      if (chapters.length >= 3) break;
    }

    // Sắp xếp theo số chương
    const sortedChapters = chapters.sort((a, b) => a.number - b.number);

    // Lưu vào cache
    if (sortedChapters.length > 0) {
      setCache(cacheKey, sortedChapters);
    }

    return sortedChapters;
  },

  // Lấy nội dung của một chương
  async getChapter(mangaId, chapterNumber) {
    try {
      // Kiểm tra cache
      const cacheKey = `chapter_content_${mangaId}_${chapterNumber}`;
      const cachedChapter = getCache(cacheKey);
      if (cachedChapter) {
        log(`Using cached chapter content for ${mangaId}/${chapterNumber}`);
        return cachedChapter;
      }

      log(`Fetching chapter ${chapterNumber} for manga ID: ${mangaId}`);

      // Xử lý đặc biệt cho Doraemon (PDF)
      if (mangaId === 'doraemon') {
        // Các định dạng tên file PDF phổ biến cho Doraemon
        const pdfFormats = [
          `/data/manga/${mangaId}/doraemon-vol-${chapterNumber}.pdf`,
          `/data/manga/${mangaId}/vol-${chapterNumber}.pdf`,
          `/data/manga/${mangaId}/${chapterNumber}.pdf`
        ];

        // Kiểm tra song song các định dạng
        const pdfChecks = pdfFormats.map(async path => {
          try {
            const response = await fetch(path, {
              method: 'HEAD',
              cache: 'no-store'
            }).catch(() => ({ ok: false }));

            return response.ok ? path : null;
          } catch {
            return null;
          }
        });

        // Lấy đường dẫn PDF đầu tiên tìm thấy
        const pdfPath = (await Promise.all(pdfChecks)).find(path => path);
        if (pdfPath) {
          const chapterData = {
            _id: `${mangaId}-chapter-${chapterNumber}`,
            id: chapterNumber,
            number: parseInt(chapterNumber),
            title: `Tập ${chapterNumber}`,
            mangaId,
            url: pdfPath,
            type: 'pdf'
          };

          // Lưu vào cache
          setCache(cacheKey, chapterData);
          return chapterData;
        }
      }

      // Xử lý đặc biệt cho Cưa Thủ (hình ảnh)
      if (mangaId === 'cưa_thủ' || mangaId === 'cua_thu') {
        // Xử lý các biến thể tên thư mục
        const normalizedId = mangaId.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        const possibleIds = [mangaId, normalizedId, 'cưa_thủ', 'cua_thu'];
        let foundPath = null;
        let foundInSubdir = false;

        // Kiểm tra các biến thể tên thư mục
        for (const id of possibleIds) {
          const testPath = `/data/manga/${id}/chapters/${chapterNumber}`;
          try {
            const response = await fetch(`${testPath}/index.json`, {
              method: 'HEAD',
              cache: 'no-store'
            }).catch(() => ({ ok: false }));

            if (response.ok) {
              foundPath = testPath;
              break;
            }
          } catch {
            // Bỏ qua lỗi
          }
        }

        // Nếu không tìm thấy, thử lại với 001.jpg
        if (!foundPath) {
          for (const id of possibleIds) {
            const testPath = `/data/manga/${id}/chapters/${chapterNumber}`;
            try {
              const response = await fetch(`${testPath}/001.jpg`, {
                method: 'HEAD',
                cache: 'no-store'
              }).catch(() => ({ ok: false }));

              if (response.ok) {
                foundPath = testPath;
                break;
              }
            } catch {
              // Bỏ qua lỗi
            }
          }
        }

        // Nếu vẫn không tìm thấy, thử với các thư mục con
        if (!foundPath) {
          // Danh sách các thư mục con có thể có
          const possibleSubdirs = [
            'pages_001_100',
            'pages_101_200',
            'pages_201_300',
            'pages_301_400',
            'pages_401_500',
            'pages_501_600',
            'pages_601_700',
            'pages_701_800',
            'pages_801_900',
            'pages_901_1000',
            'pages_1001_plus'
          ];

          for (const id of possibleIds) {
            const basePath = `/data/manga/${id}/chapters/${chapterNumber}`;

            for (const subdir of possibleSubdirs) {
              const testPath = `${basePath}/${subdir}`;
              try {
                const response = await fetch(`${testPath}/001.jpg`, {
                  method: 'HEAD',
                  cache: 'no-store'
                }).catch(() => ({ ok: false }));

                if (response.ok) {
                  foundPath = basePath;
                  foundInSubdir = true;
                  log(`Found images in subdirectory: ${subdir}`);
                  break;
                }
              } catch {
                // Bỏ qua lỗi
              }
            }

            if (foundPath) break;
          }
        }

        // Nếu không tìm thấy đường dẫn nào, trả về lỗi
        if (!foundPath) {
          log(`Could not find valid path for manga ${mangaId}, chapter ${chapterNumber}`);
          return null;
        }

        const imagesPath = foundPath;
        log(`Found valid path for Cưa Thủ: ${imagesPath}`);
        log(`Found in subdirectory: ${foundInSubdir}`);

        // Kiểm tra xem có index.json không
        try {
          const indexResponse = await fetch(`${imagesPath}/index.json`, {
            method: 'HEAD',
            cache: 'no-store'
          }).catch(() => ({ ok: false }));

          if (indexResponse.ok) {
            // Nếu có index.json, lấy thông tin từ đó
            log(`Found index.json for ${mangaId}/${chapterNumber}`);
            const indexData = await (await fetch(`${imagesPath}/index.json`)).json();
            log(`Loaded index.json with ${indexData.pageGroups?.length || 0} page groups`);

            // Lấy ảnh từ preloadGroups nếu có
            const initialImages = [];

            if (indexData.preloadGroups && Array.isArray(indexData.preloadGroups) && indexData.pageGroups) {
              // Lấy các nhóm được chỉ định preload
              for (const groupName of indexData.preloadGroups) {
                const group = indexData.pageGroups.find(g => g.name === groupName);
                if (group && Array.isArray(group.images)) {
                  for (const img of group.images) {
                    initialImages.push(`${imagesPath}/${img}`);
                  }
                }
              }
              log(`Loaded ${initialImages.length} images from preloadGroups`);
            }
            // Nếu không có preloadGroups, lấy nhóm đầu tiên
            else if (indexData.pageGroups && indexData.pageGroups.length > 0) {
              const firstGroup = indexData.pageGroups[0];
              if (firstGroup && Array.isArray(firstGroup.images)) {
                for (const img of firstGroup.images) {
                  initialImages.push(`${imagesPath}/${img}`);
                }
              }
              log(`Loaded ${initialImages.length} images from first page group`);
            }

            // Nếu không có ảnh từ pageGroups, tạo danh sách ảnh mặc định
            if (initialImages.length === 0) {
              for (let i = 1; i <= 20; i++) {
                initialImages.push(`${imagesPath}/${i.toString().padStart(3, '0')}.jpg`);
              }
              log(`Created ${initialImages.length} default image paths`);
            }

            const chapterData = {
              _id: `${mangaId}-chapter-${chapterNumber}`,
              id: chapterNumber,
              number: parseInt(chapterNumber),
              title: indexData.title || `Chương ${chapterNumber}`,
              mangaId,
              images: initialImages,
              type: 'images',
              hasIndex: true,
              totalPages: indexData.totalPages || initialImages.length,
              indexPath: `${imagesPath}/index.json`,
              pageGroups: indexData.pageGroups,
              foundInSubdir: foundInSubdir
            };

            // Lưu vào cache
            setCache(cacheKey, chapterData);
            return chapterData;
          }
        } catch (error) {
          log(`Error checking index.json for ${mangaId}/${chapterNumber}:`, error);
        }

        // Nếu đã tìm thấy trong thư mục con, thử tải ảnh từ tất cả các thư mục con
        if (foundInSubdir) {
          log(`Loading images from subdirectories for ${mangaId}/${chapterNumber}`);

          try {
            // Danh sách các thư mục con có thể có
            const possibleSubdirs = [
              'pages_001_100',
              'pages_101_200',
              'pages_201_300',
              'pages_301_400',
              'pages_401_500',
              'pages_501_600',
              'pages_601_700',
              'pages_701_800',
              'pages_801_900',
              'pages_901_1000',
              'pages_1001_plus'
            ];

            let allImages = [];

            // Kiểm tra từng thư mục con
            for (const subdir of possibleSubdirs) {
              const subdirPath = `${imagesPath}/${subdir}`;

              try {
                // Kiểm tra xem thư mục con có tồn tại không
                const testResponse = await fetch(`${subdirPath}/001.jpg`, {
                  method: 'HEAD',
                  cache: 'no-store'
                }).catch(() => ({ ok: false }));

                if (testResponse.ok) {
                  log(`Found subdirectory ${subdir}`);

                  // Kiểm tra 100 ảnh trong thư mục con
                  const imagePromises = [];

                  for (let i = 1; i <= 100; i++) {
                    const imagePath = `${subdirPath}/${i.toString().padStart(3, '0')}.jpg`;
                    imagePromises.push(
                      fetch(imagePath, { method: 'HEAD', cache: 'no-store' })
                        .then(res => res.ok ? imagePath : null)
                        .catch(() => null)
                    );
                  }

                  const validImages = (await Promise.all(imagePromises)).filter(img => img);
                  log(`Found ${validImages.length} images in ${subdir}`);

                  allImages = [...allImages, ...validImages];
                }
              } catch (error) {
                log(`Error checking subdirectory ${subdir}:`, error);
              }
            }

            if (allImages.length > 0) {
              // Sắp xếp ảnh theo thứ tự
              allImages.sort((a, b) => {
                const numA = parseInt(a.match(/(\d+)\.jpg$/)[1]);
                const numB = parseInt(b.match(/(\d+)\.jpg$/)[1]);
                return numA - numB;
              });

              log(`Total images found in subdirectories: ${allImages.length}`);

              const chapterData = {
                _id: `${mangaId}-chapter-${chapterNumber}`,
                id: chapterNumber,
                number: parseInt(chapterNumber),
                title: `Chương ${chapterNumber}`,
                mangaId,
                images: allImages,
                type: 'images',
                hasSubdirs: true,
                foundInSubdir: true,
                basePath: imagesPath
              };

              // Lưu vào cache
              setCache(cacheKey, chapterData);
              return chapterData;
            }
          } catch (error) {
            log(`Error loading images from subdirectories:`, error);
          }
        }

        // Kiểm tra các định dạng ảnh phổ biến
        const imageFormats = ['jpg', 'png', 'webp'];

        // Tìm định dạng ảnh
        for (const format of imageFormats) {
          try {
            const firstImagePath = `${imagesPath}/001.${format}`;
            const response = await fetch(firstImagePath, {
              method: 'HEAD',
              cache: 'no-store'
            }).catch(() => ({ ok: false }));

            if (response.ok) {
              log(`Found images with format ${format} for ${mangaId}/${chapterNumber}`);

              // Nếu tìm thấy ảnh đầu tiên, tạo danh sách 20 ảnh đầu tiên
              const images = [];

              // Kiểm tra 20 ảnh đầu tiên (song song)
              const imageChecks = Array.from({ length: 20 }, (_, i) => {
                const imagePath = `${imagesPath}/${(i + 1).toString().padStart(3, '0')}.${format}`;
                return fetch(imagePath, {
                  method: 'HEAD',
                  cache: 'no-store'
                })
                  .then(res => res.ok ? imagePath : null)
                  .catch(() => null);
              });

              const validImages = (await Promise.all(imageChecks)).filter(img => img);
              log(`Found ${validImages.length} valid images`);

              if (validImages.length > 0) {
                const chapterData = {
                  _id: `${mangaId}-chapter-${chapterNumber}`,
                  id: chapterNumber,
                  number: parseInt(chapterNumber),
                  title: `Chương ${chapterNumber}`,
                  mangaId,
                  images: validImages,
                  type: 'images',
                  imageFormat: format,
                  basePath: imagesPath
                };

                // Lưu vào cache
                setCache(cacheKey, chapterData);
                return chapterData;
              }
            }
          } catch (error) {
            log(`Error checking images with format ${format}:`, error);
          }
        }

        // Kiểm tra cấu trúc thư mục con (pages_001_100, pages_101_200, v.v.)
        try {
          // Danh sách các thư mục con có thể có
          const possibleSubdirs = [
            'pages_001_100',
            'pages_101_200',
            'pages_201_300',
            'pages_301_400',
            'pages_401_500',
            'pages_501_600',
            'pages_601_700',
            'pages_701_800',
            'pages_801_900',
            'pages_901_1000',
            'pages_1001_plus'
          ];

          // Kiểm tra xem có thư mục con nào tồn tại không
          let foundSubdir = false;
          let allImages = [];

          for (const subdir of possibleSubdirs) {
            const subdirPath = `${imagesPath}/${subdir}`;
            const firstImagePath = `${subdirPath}/001.jpg`;

            try {
              const response = await fetch(firstImagePath, {
                method: 'HEAD',
                cache: 'no-store'
              }).catch(() => ({ ok: false }));

              if (response.ok) {
                log(`Found subdirectory: ${subdir} for ${mangaId}/${chapterNumber}`);
                foundSubdir = true;

                // Kiểm tra 100 ảnh trong thư mục con này
                const imageChecks = Array.from({ length: 100 }, (_, i) => {
                  const imagePath = `${subdirPath}/${(i + 1).toString().padStart(3, '0')}.jpg`;
                  return fetch(imagePath, {
                    method: 'HEAD',
                    cache: 'no-store'
                  })
                    .then(res => res.ok ? imagePath : null)
                    .catch(() => null);
                });

                const validImages = (await Promise.all(imageChecks)).filter(img => img);
                log(`Found ${validImages.length} valid images in subdirectory ${subdir}`);

                // Thêm vào danh sách tất cả ảnh
                allImages = [...allImages, ...validImages];
              }
            } catch (error) {
              log(`Error checking subdirectory ${subdir}:`, error);
            }
          }

          // Nếu tìm thấy ít nhất một thư mục con và có ảnh
          if (foundSubdir && allImages.length > 0) {
            // Sắp xếp ảnh theo thứ tự
            allImages.sort((a, b) => {
              const numA = parseInt(a.match(/(\d+)\.jpg$/)[1]);
              const numB = parseInt(b.match(/(\d+)\.jpg$/)[1]);
              return numA - numB;
            });

            const chapterData = {
              _id: `${mangaId}-chapter-${chapterNumber}`,
              id: chapterNumber,
              number: parseInt(chapterNumber),
              title: `Chương ${chapterNumber}`,
              mangaId,
              images: allImages,
              type: 'images',
              hasSubdirs: true,
              basePath: imagesPath
            };

            // Lưu vào cache
            setCache(cacheKey, chapterData);
            return chapterData;
          }
        } catch (error) {
          log(`Error checking subdirectory structure:`, error);
        }

        // Nếu không tìm thấy ảnh nào, thử tạo danh sách ảnh mặc định
        log(`Creating default image list for ${mangaId}/${chapterNumber}`);
        const defaultImages = Array.from({ length: 20 }, (_, i) =>
          `${imagesPath}/${(i + 1).toString().padStart(3, '0')}.jpg`
        );

        const chapterData = {
          _id: `${mangaId}-chapter-${chapterNumber}`,
          id: chapterNumber,
          number: parseInt(chapterNumber),
          title: `Chương ${chapterNumber}`,
          mangaId,
          images: defaultImages,
          type: 'images',
          basePath: imagesPath,
          isDefault: true
        };

        // Lưu vào cache
        setCache(cacheKey, chapterData);
        return chapterData;
      }

      // Thử lấy từ chapters.json
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const chapters = await fetch(`/data/manga/${mangaId}/chapters.json`, {
          signal: controller.signal,
          cache: 'no-store'
        }).catch(() => ({ ok: false }));

        clearTimeout(timeoutId);

        if (chapters.ok) {
          const allChapters = await chapters.json();
          const chapter = allChapters.find(ch =>
            ch.number === parseInt(chapterNumber) ||
            ch.id === chapterNumber ||
            ch.id === parseInt(chapterNumber)
          );

          if (chapter) {
            // Xử lý đường dẫn ảnh và URL
            const processedChapter = {
              ...chapter,
              mangaId,
              id: chapter.id || chapterNumber,
              number: parseInt(chapterNumber),
              title: chapter.title || `Chương ${chapterNumber}`,
              images: chapter.images?.map(img =>
                img.startsWith('http') || img.startsWith('/')
                  ? img
                  : `/data/manga/${mangaId}/chapters/${chapterNumber}/${img}`
              ),
              type: chapter.images ? 'images' : chapter.url ? 'pdf' : 'unknown',
              url: chapter.url ? (
                chapter.url.startsWith('http') || chapter.url.startsWith('/')
                  ? chapter.url
                  : `/data/manga/${mangaId}/${chapter.url}`
              ) : undefined
            };

            // Lưu vào cache
            setCache(cacheKey, processedChapter);
            return processedChapter;
          }
        }
      } catch (error) {
        log(`Error loading chapter from local: ${mangaId}/${chapterNumber}`, error);
      }

      // Kiểm tra các định dạng PDF phổ biến
      const pdfFormats = [
        `/data/manga/${mangaId}/Vol${chapterNumber.toString().padStart(2, '0')}.pdf`,
        `/data/manga/${mangaId}/vol${chapterNumber}.pdf`,
        `/data/manga/${mangaId}/chapter${chapterNumber}.pdf`,
        `/data/manga/${mangaId}/${chapterNumber}.pdf`
      ];

      // Kiểm tra song song các định dạng
      const pdfChecks = pdfFormats.map(async path => {
        try {
          const response = await fetch(path, {
            method: 'HEAD',
            cache: 'no-store'
          }).catch(() => ({ ok: false }));

          return response.ok ? path : null;
        } catch {
          return null;
        }
      });

      // Lấy đường dẫn PDF đầu tiên tìm thấy
      const pdfPath = (await Promise.all(pdfChecks)).find(path => path);
      if (pdfPath) {
        const chapterData = {
          _id: `${mangaId}-chapter-${chapterNumber}`,
          id: chapterNumber,
          number: parseInt(chapterNumber),
          title: `Tập ${chapterNumber}`,
          mangaId,
          url: pdfPath,
          type: 'pdf'
        };

        // Lưu vào cache
        setCache(cacheKey, chapterData);
        return chapterData;
      }

      // Kiểm tra các thư mục chứa ảnh
      const imagesPath = `/data/manga/${mangaId}/chapters/${chapterNumber}`;

      // Kiểm tra xem có index.json không
      try {
        const indexResponse = await fetch(`${imagesPath}/index.json`, {
          method: 'HEAD',
          cache: 'no-store'
        }).catch(() => ({ ok: false }));

        if (indexResponse.ok) {
          const indexData = await (await fetch(`${imagesPath}/index.json`)).json();

          // Chỉ lấy 20 ảnh đầu tiên
          const initialImages = [];

          if (indexData.pageGroups && indexData.pageGroups.length > 0) {
            const firstGroup = indexData.pageGroups[0];
            if (firstGroup && Array.isArray(firstGroup.images)) {
              for (let i = 0; i < Math.min(20, firstGroup.images.length); i++) {
                initialImages.push(`${imagesPath}/${firstGroup.images[i]}`);
              }
            }
          }

          if (initialImages.length === 0) {
            for (let i = 1; i <= 20; i++) {
              initialImages.push(`${imagesPath}/${i.toString().padStart(3, '0')}.jpg`);
            }
          }

          const chapterData = {
            _id: `${mangaId}-chapter-${chapterNumber}`,
            id: chapterNumber,
            number: parseInt(chapterNumber),
            title: indexData.title || `Chương ${chapterNumber}`,
            mangaId,
            images: initialImages,
            type: 'images',
            hasIndex: true,
            totalPages: indexData.totalPages || initialImages.length,
            indexPath: `${imagesPath}/index.json`
          };

          // Lưu vào cache
          setCache(cacheKey, chapterData);
          return chapterData;
        }
      } catch (error) {
        // Bỏ qua lỗi
      }

      // Kiểm tra các định dạng ảnh phổ biến
      const imageFormats = ['jpg', 'png', 'webp'];

      // Tìm định dạng ảnh và tạo danh sách ảnh
      for (const format of imageFormats) {
        try {
          // Kiểm tra ảnh đầu tiên
          const firstImagePath = `${imagesPath}/001.${format}`;
          const response = await fetch(firstImagePath, {
            method: 'HEAD',
            cache: 'no-store'
          }).catch(() => ({ ok: false }));

          if (response.ok) {
            // Tạo danh sách 20 ảnh đầu tiên
            const images = Array.from({ length: 20 }, (_, i) =>
              `${imagesPath}/${(i + 1).toString().padStart(3, '0')}.${format}`
            );

            const chapterData = {
              _id: `${mangaId}-chapter-${chapterNumber}`,
              id: chapterNumber,
              number: parseInt(chapterNumber),
              title: `Chương ${chapterNumber}`,
              mangaId,
              images,
              type: 'images',
              imageFormat: format,
              basePath: imagesPath,
              lazyLoad: true
            };

            // Lưu vào cache
            setCache(cacheKey, chapterData);
            return chapterData;
          }
        } catch (error) {
          // Bỏ qua lỗi
        }
      }

      throw new Error('Chapter not found');
    } catch (error) {
      log(`Error fetching chapter ${chapterNumber} for manga ${mangaId}:`, error);
      return null;
    }
  }
};

export default MangaService;