import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import MangaService from '../../services/MangaService';
import { FaArrowLeft, FaArrowRight, FaList, FaHome, FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import MangaSlideshow from '../reader/MangaSlideshow';

// Cấu hình worker cho react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * MangaReader - Component đọc truyện manga
 */
const MangaReader = () => {
  const { mangaId, chapterNumber } = useParams();
  const [manga, setManga] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showChapterList, setShowChapterList] = useState(false);
  const navigate = useNavigate();

  // Lấy thông tin manga và chapter
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching data for manga ID: ${mangaId}, chapter: ${chapterNumber}`);

        // Lấy thông tin manga
        const mangaData = await MangaService.getManga(mangaId);
        if (!mangaData) {
          throw new Error('Không tìm thấy thông tin manga');
        }
        console.log('Loaded manga data:', mangaData);
        setManga(mangaData);

        // Lấy danh sách chapter
        const chaptersData = await MangaService.getChapters(mangaId);
        if (!chaptersData || !Array.isArray(chaptersData)) {
          throw new Error('Không thể tải danh sách chapter');
        }
        console.log(`Loaded ${chaptersData.length} chapters:`, chaptersData);

        // Đảm bảo mỗi chapter có đủ thông tin cần thiết
        const processedChapters = chaptersData.map(chapter => ({
          ...chapter,
          id: chapter.id || chapter._id || `${mangaId}-chapter-${chapter.number}`,
          number: chapter.number || parseInt(chapter.id) || 0,
          title: chapter.title || `Chapter ${chapter.number}`,
          mangaId: mangaId
        }));

        // Sắp xếp chapter theo số thứ tự
        const sortedChapters = [...processedChapters].sort((a, b) => a.number - b.number);
        setChapters(sortedChapters);

        // Tìm chapter hiện tại
        console.log(`Looking for chapter with number: ${chapterNumber}`);
        const chapterNum = parseInt(chapterNumber);
        const currentChapter = sortedChapters.find(c =>
          c.number === chapterNum ||
          c.id === chapterNumber ||
          c.id === chapterNum.toString()
        );

        if (currentChapter) {
          console.log('Found current chapter:', currentChapter);

          // Nếu chapter không có nội dung, tải nội dung chi tiết
          if (!currentChapter.images && !currentChapter.url) {
            console.log('Chapter has no content, fetching detailed chapter data');
            const detailedChapter = await MangaService.getChapter(mangaId, chapterNum);
            if (detailedChapter) {
              console.log('Loaded detailed chapter data:', detailedChapter);
              setChapter(detailedChapter);
            } else {
              setChapter(currentChapter);
            }
          } else {
            setChapter(currentChapter);
          }
        } else {
          console.error(`Chapter ${chapterNumber} not found in chapters list:`, sortedChapters);
          throw new Error(`Không tìm thấy chapter ${chapterNumber}`);
        }
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setError(`Không thể tải truyện: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mangaId, chapterNumber]);

  // Xử lý khi PDF được tải
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  // Chuyển đến trang trước
  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  // Chuyển đến trang tiếp theo
  const nextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // Chuyển đến chapter khác
  const goToChapter = (chapterNumber) => {
    navigate(`/manga/${mangaId}/chapter/${chapterNumber}`);
    setShowChapterList(false);
  };

  // Tìm chapter trước và sau
  const currentIndex = chapters.findIndex(c => c.number === parseInt(chapterNumber));
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link to={`/manga/${mangaId}`} className="text-blue-600 hover:underline mt-2 inline-block">
            Quay lại trang truyện
          </Link>
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!manga || !chapter) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Không tìm thấy thông tin truyện hoặc chương.</p>
          <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Xác định loại nội dung (PDF hoặc ảnh)
  const isPdf = chapter?.url && (chapter.url.endsWith('.pdf') || chapter.type === 'pdf');
  const isImages = chapter?.images && Array.isArray(chapter.images) && chapter.images.length > 0;

  console.log('Content type check:', { isPdf, isImages, chapter });

  return (
    <div className="manga-reader bg-gray-100 min-h-screen">
      {/* Thanh điều khiển phía trên */}
      <div className="top-controls fixed top-0 left-0 right-0 bg-gray-900 text-white p-3 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to={`/manga/${mangaId}`} className="flex items-center">
              <FaHome className="mr-2" /> Về trang truyện
            </Link>
            <button
              onClick={() => setShowChapterList(!showChapterList)}
              className="flex items-center"
            >
              <FaList className="mr-2" /> Danh sách chương
            </button>
          </div>
          <div className="text-center">
            <h1 className="font-bold">{manga.title} - {chapter.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            {prevChapter && (
              <button
                onClick={() => goToChapter(prevChapter.number)}
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
              >
                Chương trước
              </button>
            )}
            {nextChapter && (
              <button
                onClick={() => goToChapter(nextChapter.number)}
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
              >
                Chương sau
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách chapter */}
      {showChapterList && (
        <div className="chapter-list fixed top-16 left-0 right-0 bg-white z-30 shadow-lg max-h-96 overflow-y-auto">
          <div className="container mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Danh sách chương</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {chapters.map((c) => (
                <button
                  key={c.number}
                  onClick={() => goToChapter(c.number)}
                  className={`p-2 rounded text-left ${c.number === parseInt(chapterNumber) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  Chương {c.number}: {c.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nội dung truyện */}
      <div className="content-container mt-16 mb-16 p-4">
        <div className="container mx-auto">
          {isPdf ? (
            <div className="pdf-container flex flex-col items-center">
              <Document
                file={chapter.url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                }
                error={
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Không thể tải file PDF. Vui lòng thử lại sau.</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={Math.min(window.innerWidth * 0.9, 800)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

              <div className="pdf-controls mt-4 flex justify-center items-center space-x-4">
                <button
                  onClick={prevPage}
                  disabled={pageNumber <= 1}
                  className={`px-4 py-2 rounded flex items-center ${pageNumber <= 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  <FaArrowLeft className="mr-2" /> Trang trước
                </button>
                <p className="text-center">
                  Trang {pageNumber} / {numPages || '?'}
                </p>
                <button
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                  className={`px-4 py-2 rounded flex items-center ${pageNumber >= numPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Trang sau <FaArrowRight className="ml-2" />
                </button>
                <a
                  href={chapter.url}
                  download
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <FaDownload className="mr-2" /> Tải PDF
                </a>
              </div>
            </div>
          ) : isImages ? (
            <MangaSlideshow
              images={chapter.images}
              title={`${manga.title} - ${chapter.title || `Chương ${chapter.number}`}`}
              onClose={() => navigate(`/manga/${mangaId}`)}
              chapters={chapters}
              currentChapter={chapter}
              mangaId={mangaId}
            />
          ) : (
            <div className="text-center p-10">
              <p className="text-xl">Không tìm thấy nội dung cho chương này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaReader;
