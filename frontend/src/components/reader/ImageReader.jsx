import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaList, FaHome, FaFilePdf, FaPlay, FaImages } from 'react-icons/fa';
import MangaSlideshow from './MangaSlideshow';
import ImageBasedMangaViewer from './ImageBasedMangaViewer';
import SimplePDFViewer from './SimplePDFViewer';
import MangaService from '../../services/MangaService';

/**
 * Component hiển thị trình đọc truyện dạng hình ảnh
 * Cho phép người dùng cuộn xuống để xem từng trang
 */
const ImageReader = () => {
  const { mangaId, chapterId } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterInfo, setChapterInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showChapterList, setShowChapterList] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [showSlideshow, setShowSlideshow] = useState(false);
  const navigate = useNavigate();

  // Lấy thông tin chapter và danh sách hình ảnh
  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        console.log(`Loading chapter data for manga: ${mangaId}, chapter: ${chapterId}`);

        // Lấy danh sách tất cả các chapter của truyện
        const chaptersData = await MangaService.getChapters(mangaId);
        if (chaptersData && Array.isArray(chaptersData)) {
          setChapters(chaptersData);
          console.log(`Loaded ${chaptersData.length} chapters for manga ${mangaId}`);
        }

        // Lấy thông tin chi tiết của chapter hiện tại
        const chapterData = await MangaService.getChapter(mangaId, chapterId);
        if (chapterData) {
          console.log('Loaded chapter data:', chapterData);
          setChapterInfo(chapterData);

          // Kiểm tra loại chapter (PDF hoặc hình ảnh)
          if (chapterData.type === 'pdf' || (chapterData.url && chapterData.url.endsWith('.pdf'))) {
            console.log('Chapter is PDF type');
            setPdfUrl(chapterData.url);
            setIsPdfMode(true);
            setLoading(false);
            return;
          }

          // Nếu chapter có danh sách hình ảnh, sử dụng nó
          if (chapterData.images && Array.isArray(chapterData.images) && chapterData.images.length > 0) {
            console.log(`Chapter has ${chapterData.images.length} images`);
            setImages(chapterData.images);
            setLoading(false);
            return;
          }
        } else {
          console.log('No chapter data found, trying alternative methods');
        }

        // Nếu không tìm thấy thông tin chapter từ API, thử các phương pháp khác

        // Đường dẫn đến thư mục chapter
        const chapterPath = `/data/manga/${mangaId}/chapters/${chapterId}`;

        // Kiểm tra xem có phải là file PDF không
        try {
          const pdfPath = `/data/manga/${mangaId}/Vol${chapterId.toString().padStart(2, '0')}.pdf`;
          const response = await fetch(pdfPath, { method: 'HEAD' });
          if (response.ok) {
            console.log(`Found PDF file: ${pdfPath}`);
            setPdfUrl(pdfPath);
            setIsPdfMode(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error checking PDF file:', error);
        }

        // Thử tìm hình ảnh trong thư mục chapter
        console.log(`Scanning for images in directory: ${chapterPath}`);
        const chapterImages = [];

        // Kiểm tra xem có thư mục chapter không
        try {
          // Thử tải một file index.json nếu có
          console.log(`Checking for index.json at ${chapterPath}/index.json`);
          const indexResponse = await fetch(`${chapterPath}/index.json`);
          if (indexResponse.ok) {
            const indexData = await indexResponse.json();

            // Kiểm tra cấu trúc mới với pageGroups
            if (indexData.pageGroups && Array.isArray(indexData.pageGroups) && indexData.pageGroups.length > 0) {
              console.log(`Found new format index.json with ${indexData.pageGroups.length} page groups`);

              // Tải nhóm trang đầu tiên ngay lập tức
              const firstGroup = indexData.pageGroups[0];
              console.log(`Loading first page group: ${firstGroup.name} (${firstGroup.startPage}-${firstGroup.endPage})`);

              // Xử lý đường dẫn ảnh cho nhóm đầu tiên
              const firstGroupImages = firstGroup.images.map(img => {
                if (img.startsWith('http') || img.startsWith('/')) {
                  return img;
                }
                return `${chapterPath}/${img}`;
              });

              // Kiểm tra xem hình ảnh đầu tiên có tồn tại không
              const checkFirstImage = async () => {
                try {
                  if (firstGroupImages.length === 0) return false;

                  const firstImagePath = firstGroupImages[0];
                  console.log(`Checking first image: ${firstImagePath}`);
                  const response = await fetch(firstImagePath, { method: 'HEAD' });
                  if (response.ok) {
                    console.log('First image exists, using page groups data');
                    return true;
                  } else {
                    console.log('First image does not exist, will try alternative methods');
                    return false;
                  }
                } catch (error) {
                  console.error('Error checking first image:', error);
                  return false;
                }
              };

              const firstImageExists = await checkFirstImage();
              if (firstImageExists) {
                // Tải trước nhóm trang thứ hai nếu có
                if (indexData.pageGroups.length > 1) {
                  const secondGroup = indexData.pageGroups[1];
                  console.log(`Preloading second page group: ${secondGroup.name} (${secondGroup.startPage}-${secondGroup.endPage})`);

                  // Tạo một mảng các promise để tải trước hình ảnh nhóm thứ hai
                  const preloadPromises = secondGroup.images.slice(0, 5).map(img => {
                    const imagePath = img.startsWith('http') || img.startsWith('/') ? img : `${chapterPath}/${img}`;
                    return fetch(imagePath, { method: 'HEAD' });
                  });

                  // Không chờ các promise này hoàn thành
                  Promise.all(preloadPromises).catch(() => {});
                }

                // Tạo danh sách tất cả các hình ảnh từ tất cả các nhóm
                const allImages = [];
                for (const group of indexData.pageGroups) {
                  const groupImages = group.images.map(img => {
                    if (img.startsWith('http') || img.startsWith('/')) {
                      return img;
                    }
                    return `${chapterPath}/${img}`;
                  });
                  allImages.push(...groupImages);
                }

                console.log(`Processed ${allImages.length} total image paths from all page groups`);

                // Cache hình ảnh bằng Service Worker nếu có
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  try {
                    // Chỉ cache 10 trang đầu tiên để tránh quá tải
                    const imagesToCache = allImages.slice(0, 10);
                    navigator.serviceWorker.controller.postMessage({
                      type: 'CACHE_MANGA_IMAGES',
                      urls: imagesToCache
                    });
                    console.log('Requested Service Worker to cache images:', imagesToCache.length);
                  } catch (error) {
                    console.error('Error requesting image caching:', error);
                  }
                }

                setImages(allImages);
                setLoading(false);
                return;
              }
            }

            // Kiểm tra cấu trúc cũ với mảng images
            if (indexData.images && Array.isArray(indexData.images) && indexData.images.length > 0) {
              console.log(`Found ${indexData.images.length} images in index.json`);

              // Xử lý đường dẫn ảnh
              const processedImages = indexData.images.map(img => {
                if (img.startsWith('http') || img.startsWith('/')) {
                  return img;
                }
                return `${chapterPath}/${img}`;
              });

              console.log(`Processed ${processedImages.length} image paths from index.json`);

              // Kiểm tra xem các hình ảnh có tồn tại không
              const checkFirstImage = async () => {
                try {
                  const firstImagePath = processedImages[0];
                  console.log(`Checking first image: ${firstImagePath}`);
                  const response = await fetch(firstImagePath, { method: 'HEAD' });
                  if (response.ok) {
                    console.log('First image exists, using index.json data');
                    return true;
                  } else {
                    console.log('First image does not exist, will try alternative methods');
                    return false;
                  }
                } catch (error) {
                  console.error('Error checking first image:', error);
                  return false;
                }
              };

              const firstImageExists = await checkFirstImage();
              if (firstImageExists) {
                setImages(processedImages);
                setLoading(false);
                return;
              } else {
                console.log('First image from index.json not found, trying alternative methods');
              }
            }
          }
        } catch (error) {
          console.log('No index.json found or error reading it:', error);
        }

        // Kiểm tra các thư mục con
        try {
          console.log('Checking for subdirectories in chapter folder');
          const subdirs = ['pages_001_100', 'pages_101_200', 'pages_201_300', 'pages_301_400', 'pages_401_500'];

          for (const subdir of subdirs) {
            const subdirPath = `${chapterPath}/${subdir}`;
            console.log(`Checking subdirectory: ${subdirPath}`);

            try {
              // Kiểm tra xem thư mục con có tồn tại không bằng cách thử tải một file
              const testResponse = await fetch(`${subdirPath}/001.jpg`, { method: 'HEAD' });
              if (testResponse.ok) {
                console.log(`Found images in subdirectory: ${subdirPath}`);

                // Tìm tất cả các hình ảnh trong thư mục con
                const subImages = [];
                for (let i = 1; i <= 100; i++) {
                  const filename = i.toString().padStart(3, '0');
                  const formats = ['.jpg', '.jpeg', '.png', '.webp'];

                  for (const format of formats) {
                    try {
                      const imagePath = `${subdirPath}/${filename}${format}`;
                      const response = await fetch(imagePath, { method: 'HEAD' });
                      if (response.ok) {
                        subImages.push(imagePath);
                        break;
                      }
                    } catch (error) {
                      // Bỏ qua lỗi
                    }
                  }
                }

                if (subImages.length > 0) {
                  console.log(`Found ${subImages.length} images in subdirectory ${subdir}`);
                  chapterImages.push(...subImages);
                }
              }
            } catch (error) {
              // Bỏ qua lỗi, thư mục con có thể không tồn tại
            }
          }
        } catch (error) {
          console.log('Error checking subdirectories:', error);
        }

        // Tối ưu: Thử tải một trang mẫu để xác định định dạng file
        const formats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const patterns = [
          // Các mẫu tên file phổ biến, sắp xếp theo thứ tự phổ biến nhất
          (i) => `${i.toString().padStart(3, '0')}`, // 001, 002, ...
          (i) => `${i}`,                            // 1, 2, ...
          (i) => `${i.toString().padStart(2, '0')}`, // 01, 02, ...
          (i) => `page-${i}`,                       // page-1, page-2, ...
          (i) => `p${i}`                            // p1, p2, ...
        ];

        // Tìm mẫu tên file và định dạng đúng
        let foundPattern = null;
        let foundFormat = null;
        let foundFirstPage = false;

        // Thử từng mẫu và định dạng cho trang đầu tiên
        for (const pattern of patterns) {
          if (foundFirstPage) break;

          for (const format of formats) {
            const filename = pattern(1);
            const imagePath = `${chapterPath}/${filename}${format}`;

            try {
              const response = await fetch(imagePath, { method: 'HEAD' });
              if (response.ok) {
                foundPattern = pattern;
                foundFormat = format;
                foundFirstPage = true;
                console.log(`Found image pattern: ${filename}${format}`);
                break;
              }
            } catch (error) {
              // Bỏ qua lỗi
            }
          }
        }

        // Nếu tìm thấy mẫu, tạo danh sách trang dựa trên mẫu đó mà không cần kiểm tra từng trang
        if (foundPattern && foundFormat) {
          console.log(`Using pattern: ${foundPattern(1)}${foundFormat} for chapter images`);

          // Tìm số trang cuối cùng bằng cách kiểm tra nhị phân
          let maxPage = 1;
          let minPage = 1;
          let lastConfirmedPage = 1;

          // Kiểm tra trang đầu tiên
          const firstImagePath = `${chapterPath}/${foundPattern(1)}${foundFormat}`;
          try {
            const response = await fetch(firstImagePath, { method: 'HEAD' });
            if (response.ok) {
              chapterImages.push(firstImagePath);
              lastConfirmedPage = 1;

              // Tìm nhanh số trang tối đa bằng cách nhân đôi
              maxPage = 2;
              let foundUpperLimit = false;

              while (!foundUpperLimit && maxPage <= 200) {
                const testPath = `${chapterPath}/${foundPattern(maxPage)}${foundFormat}`;
                try {
                  const response = await fetch(testPath, { method: 'HEAD' });
                  if (response.ok) {
                    lastConfirmedPage = maxPage;
                    maxPage *= 2; // Nhân đôi để tìm nhanh giới hạn trên
                  } else {
                    foundUpperLimit = true;
                  }
                } catch (error) {
                  foundUpperLimit = true;
                }
              }

              // Tìm chính xác số trang cuối cùng bằng tìm kiếm nhị phân
              let left = lastConfirmedPage;
              let right = maxPage;

              while (left <= right && left <= 200) {
                const mid = Math.floor((left + right) / 2);
                const testPath = `${chapterPath}/${foundPattern(mid)}${foundFormat}`;

                try {
                  const response = await fetch(testPath, { method: 'HEAD' });
                  if (response.ok) {
                    lastConfirmedPage = mid;
                    left = mid + 1;
                  } else {
                    right = mid - 1;
                  }
                } catch (error) {
                  right = mid - 1;
                }
              }

              // Tạo danh sách trang từ 1 đến trang cuối cùng đã xác nhận
              for (let i = 2; i <= lastConfirmedPage; i++) {
                chapterImages.push(`${chapterPath}/${foundPattern(i)}${foundFormat}`);
              }

              console.log(`Found ${chapterImages.length} pages using binary search`);
            }
          } catch (error) {
            console.error('Error checking first page:', error);
          }
        } else {
          // Nếu không tìm thấy mẫu, thử phương pháp cũ nhưng với số lượng request giảm
          console.log('No consistent pattern found, trying alternative method with reduced requests');

          // Giới hạn số lượng trang để tránh quá nhiều request
          const maxPages = 10; // Giảm mạnh số lượng request

          // Chỉ kiểm tra các mẫu phổ biến nhất
          const reducedPatterns = patterns.slice(0, 3); // Chỉ lấy 3 mẫu đầu tiên
          const reducedFormats = formats.slice(0, 3); // Chỉ lấy 3 định dạng đầu tiên

          // Tạo danh sách các promise để kiểm tra tất cả các mẫu tên file
          const checkImagePromises = [];

          for (let i = 1; i <= maxPages; i++) {
            for (const pattern of reducedPatterns) {
              for (const format of reducedFormats) {
                const filename = pattern(i);
                const imagePath = `${chapterPath}/${filename}${format}`;

                // Tạo promise để kiểm tra file
                const checkPromise = (async () => {
                  try {
                    const response = await fetch(imagePath, { method: 'HEAD' });
                    if (response.ok) {
                      return imagePath;
                    }
                  } catch (error) {
                    // Bỏ qua lỗi
                  }
                  return null;
                })();

                checkImagePromises.push(checkPromise);
              }
            }
          }

          // Chờ tất cả các promise hoàn thành
          const results = await Promise.all(checkImagePromises);

          // Lọc kết quả, loại bỏ các giá trị null
          const validImages = results.filter(path => path !== null);

          // Sắp xếp hình ảnh theo thứ tự trang
          validImages.sort((a, b) => {
            // Trích xuất số trang từ đường dẫn
            const getPageNumber = (path) => {
              const match = path.match(/\/(\d+)\./) || path.match(/page-(\d+)\./) || path.match(/p(\d+)\./);
              return match ? parseInt(match[1]) : 0;
            };

            return getPageNumber(a) - getPageNumber(b);
          });

          chapterImages.push(...validImages);
        }

        if (chapterImages.length > 0) {
          console.log(`Found ${chapterImages.length} images in directory`);

          // Cache hình ảnh bằng Service Worker nếu có
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
              // Chỉ cache 10 trang đầu tiên để tránh quá tải
              const imagesToCache = chapterImages.slice(0, 10);
              navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_MANGA_IMAGES',
                urls: imagesToCache
              });
              console.log('Requested Service Worker to cache images:', imagesToCache.length);
            } catch (error) {
              console.error('Error requesting image caching:', error);
            }
          }

          setImages(chapterImages);
          setLoading(false);
        } else {
          console.error('No images found for this chapter');
          setError('Không thể tải hình ảnh cho chapter này. Vui lòng thử lại sau.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading chapter data:', error);
        setError('Đã xảy ra lỗi khi tải dữ liệu chapter. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [mangaId, chapterId]);

  // Xử lý chuyển đến chapter trước
  const handlePrevChapter = () => {
    if (!chapters.length || !chapterInfo) return;

    const currentIndex = getCurrentChapterIndex();
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];
      const chapterId = prevChapter.id || prevChapter._id || prevChapter.number;
      navigate(`/manga/${mangaId}/chapter/${chapterId}`);
    }
  };

  // Xử lý chuyển đến chapter sau
  const handleNextChapter = () => {
    if (!chapters.length || !chapterInfo) return;

    const currentIndex = getCurrentChapterIndex();
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      const chapterId = nextChapter.id || nextChapter._id || nextChapter.number;
      navigate(`/manga/${mangaId}/chapter/${chapterId}`);
    }
  };

  // Xử lý quay về trang chủ
  const handleGoHome = () => {
    navigate('/');
  };

  // Xử lý quay về trang chi tiết manga
  const handleGoToManga = () => {
    navigate(`/manga/${mangaId}`);
  };

  // Xử lý chọn chapter từ danh sách
  const handleSelectChapter = (chapterId) => {
    navigate(`/manga/${mangaId}/chapter/${chapterId}`);
    setShowChapterList(false);
  };

  // Lấy chỉ số của chapter hiện tại trong danh sách
  const getCurrentChapterIndex = () => {
    if (!chapters.length || !chapterInfo) return -1;

    return chapters.findIndex(c =>
      c.id === chapterInfo.id ||
      c._id === chapterInfo._id ||
      c.number === chapterInfo.number
    );
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-gray-900 text-white h-screen">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Lỗi</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={handleGoToManga}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Quay lại trang chi tiết
          </button>
        </div>
      ) : isPdfMode ? (
        <SimplePDFViewer
          pdfUrl={pdfUrl}
          title={chapterInfo ?
            `${chapterInfo.title || `Chapter ${chapterInfo.id || chapterInfo.number}`}` :
            `Chapter ${chapterId}`
          }
          onClose={handleGoToManga}
          chapters={chapters}
          currentChapter={chapterInfo}
        />
      ) : (
        <ImageBasedMangaViewer
          images={images}
          title={chapterInfo ?
            `${chapterInfo.title || `Chapter ${chapterInfo.id || chapterInfo.number}`}` :
            `Chapter ${chapterId}`
          }
          onClose={handleGoToManga}
          chapters={chapters}
          currentChapter={chapterInfo}
          mangaId={mangaId}
        />
      )}
    </>
  );
};

export default ImageReader;
