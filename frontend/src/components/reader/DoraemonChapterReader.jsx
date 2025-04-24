import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimplePDFViewer from './SimplePDFViewer';
import MangaService from '../../services/MangaService';
import { toast } from 'react-toastify';

/**
 * DoraemonChapterReader - Component để đọc chương truyện Doraemon
 */
const DoraemonChapterReader = () => {
  const { chapterNumber } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu truyện và chương
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin truyện
        const mangaData = await MangaService.getManga('doraemon');
        if (mangaData) {
          setStory(mangaData);

          // Lấy danh sách chương
          const chaptersData = await MangaService.getChapters('doraemon');
          if (chaptersData) {
            setChapters(chaptersData);

            // Tìm chương hiện tại
            const currentChapter = chaptersData.find(ch => ch.number === parseInt(chapterNumber));
            if (currentChapter) {
              console.log('Found chapter:', currentChapter);
              setChapter(currentChapter);

              // Cập nhật tiêu đề trang
              document.title = `${currentChapter.title} - ${mangaData.title}`;
            } else {
              console.error(`Không tìm thấy chương ${chapterNumber}`);
              toast.error(`Không tìm thấy chương ${chapterNumber}`);
              navigate('/doraemon');
            }
          }
        } else {
          toast.error('Không thể tải thông tin truyện Doraemon');
          navigate('/');
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chương truyện:', error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu chương truyện');
        navigate('/doraemon');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chapterNumber, navigate]);

  // Quay về trang chi tiết truyện
  const handleClose = () => {
    navigate('/doraemon');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chapter || !story) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Không tìm thấy chương truyện</h2>
        <p className="mb-6">Chương bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button
          onClick={() => navigate('/doraemon')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Quay lại trang chi tiết
        </button>
      </div>
    );
  }

  return (
    <SimplePDFViewer
      pdfUrl={chapter.url}
      title={`${story.title} - ${chapter.title}`}
      onClose={handleClose}
      chapters={chapters}
      currentChapter={chapter}
    />
  );
};

export default DoraemonChapterReader;
