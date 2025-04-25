import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaHeart, FaBookmark, FaStar, FaRegStar, FaRegBookmark, FaRegHeart, FaList, FaHistory, FaComment, FaShare, FaExclamationTriangle } from 'react-icons/fa';
import MangaService from '../../services/MangaService';

/**
 * StoryDetail - Trang chi tiết truyện
 */
const StoryDetail = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/';

  // Lấy dữ liệu truyện
  useEffect(() => {
    const fetchStoryData = async () => {
      setLoading(true);
      try {
        // Kiểm tra xem có dữ liệu local không
        try {
          // Lấy thông tin truyện từ dữ liệu local
          const mangaData = await MangaService.getManga(id);
          if (mangaData) {
            setStory(mangaData);

            // Lấy danh sách chương từ dữ liệu local
            const chaptersData = await MangaService.getChapters(id);
            if (chaptersData) {
              setChapters(chaptersData);
            }

            // Tạo bình luận mẫu
            setComments(generateSampleComments(id));
            return;
          }
        } catch (localError) {
          console.log('Không tìm thấy dữ liệu local, sử dụng API');
        }

        // Nếu không có dữ liệu local, thử lấy từ API
        const storyResponse = await axios.get(`${API_URL}stories/${id}`);
        const chaptersResponse = await axios.get(`${API_URL}stories/${id}/chapters`);
        const commentsResponse = await axios.get(`${API_URL}stories/${id}/comments`);

        if (storyResponse.status === 200) {
          setStory(storyResponse.data);
        }

        if (chaptersResponse.status === 200) {
          setChapters(chaptersResponse.data);
        }

        if (commentsResponse.status === 200) {
          setComments(commentsResponse.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu truyện:', error);

        // Dữ liệu mẫu để test
        const sampleStory = generateSampleStory(id);
        setStory(sampleStory);
        setChapters(generateSampleChapters(id, sampleStory.chapters));
        setComments(generateSampleComments(id));

        toast.error('Không thể lấy dữ liệu truyện. Đang hiển thị dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoryData();
  }, [id]);

  // Tạo dữ liệu mẫu để test
  const generateSampleStory = (storyId) => {
    return {
      _id: storyId,
      title: 'Truyện mẫu chi tiết',
      author: 'Tác giả mẫu',
      description: 'Đây là mô tả chi tiết về truyện mẫu. Truyện có nội dung hấp dẫn với nhiều tình tiết bất ngờ, các nhân vật được xây dựng sâu sắc và có sự phát triển rõ ràng. Cốt truyện lôi cuốn người đọc từ đầu đến cuối với nhiều bước ngoặt không thể đoán trước. Đây là một trong những tác phẩm tiêu biểu của tác giả, nhận được nhiều đánh giá tích cực từ độc giả và giới phê bình.',
      genre: 'Hành động',
      status: 'ongoing',
      views: 15789,
      likes: 2345,
      rating: 4.7,
      chapters: 50,
      updatedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail: 'https://picsum.photos/id/237/400/600',
      tags: ['Phiêu lưu', 'Kỳ ảo', 'Võ thuật', 'Xuyên không'],
      ageRating: '16+',
      relatedStories: [
        { _id: 'related-1', title: 'Truyện liên quan 1', thumbnail: 'https://picsum.photos/id/238/300/400' },
        { _id: 'related-2', title: 'Truyện liên quan 2', thumbnail: 'https://picsum.photos/id/239/300/400' },
        { _id: 'related-3', title: 'Truyện liên quan 3', thumbnail: 'https://picsum.photos/id/240/300/400' }
      ]
    };
  };

  // Tạo danh sách chương mẫu
  const generateSampleChapters = (storyId, chapterCount) => {
    return Array.from({ length: chapterCount }, (_, i) => {
      const chapterNumber = chapterCount - i;
      const date = new Date();
      date.setDate(date.getDate() - i);

      return {
        _id: `${storyId}-chapter-${chapterNumber}`,
        number: chapterNumber,
        title: `Chương ${chapterNumber}: ${chapterNumber % 5 === 0 ? 'Chương đặc biệt' : 'Tiêu đề chương'}`,
        views: Math.floor(Math.random() * 1000) + 100,
        createdAt: date.toISOString(),
        isLocked: chapterNumber % 7 === 0 // Khóa một số chương VIP
      };
    });
  };

  // Tạo danh sách bình luận mẫu
  const generateSampleComments = (storyId) => {
    const userNames = ['Người dùng A', 'Người dùng B', 'Người dùng C', 'Người dùng D', 'Người dùng E'];

    return Array.from({ length: 10 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      return {
        _id: `${storyId}-comment-${i + 1}`,
        userId: `user-${i + 1}`,
        userName: userNames[i % userNames.length],
        userAvatar: `https://i.pravatar.cc/150?img=${i + 10}`,
        content: `Đây là bình luận mẫu thứ ${i + 1} về truyện này. ${
          i % 3 === 0 ? 'Truyện rất hay và lôi cuốn!' :
          i % 3 === 1 ? 'Tôi rất thích nhân vật chính.' :
          'Mong tác giả ra chương mới sớm.'
        }`,
        createdAt: date.toISOString(),
        likes: Math.floor(Math.random() * 50)
      };
    });
  };

  // Format thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Xử lý đánh dấu truyện
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Đã bỏ đánh dấu truyện' : 'Đã đánh dấu truyện');
  };

  // Xử lý thích truyện
  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Đã bỏ thích truyện' : 'Đã thích truyện');
  };

  // Xử lý đánh giá truyện
  const handleRate = (rating) => {
    setUserRating(rating);
    toast.success(`Đã đánh giá ${rating} sao`);
  };

  // Xử lý gửi bình luận
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    // Thêm bình luận mới vào đầu danh sách
    const newComment = {
      _id: `new-comment-${Date.now()}`,
      userId: 'current-user',
      userName: 'Bạn',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      content: commentText,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setComments([newComment, ...comments]);
    setCommentText('');
    toast.success('Đã gửi bình luận');
  };

  // Xử lý báo cáo truyện
  const handleReport = () => {
    toast.info('Đã gửi báo cáo. Chúng tôi sẽ xem xét nội dung này.');
  };

  // Xử lý chia sẻ truyện
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết vào clipboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Không tìm thấy truyện</h2>
        <p className="mb-6">Truyện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{story.title}</h1>
          <div className="flex items-center text-sm mt-1">
            <span className="mr-4">Tác giả: {story.author}</span>
            <span className="mr-4">Thể loại: {story.genre}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              story.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              {story.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
            </span>
          </div>
        </div>
      </div>

      {/* Story Info */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="md:w-1/4 mb-6 md:mb-0 md:pr-6">
            <div className="relative">
              <img
                src={story.thumbnail}
                alt={story.title}
                className="w-full h-auto rounded-lg shadow-md"
              />
              {story.ageRating && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {story.ageRating}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center text-gray-700">
                  <FaEye className="mr-2" />
                  Lượt xem
                </span>
                <span className="font-semibold">{story.views ? story.views.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center text-gray-700">
                  <FaHeart className="mr-2 text-red-500" />
                  Lượt thích
                </span>
                <span className="font-semibold">{story.likes ? story.likes.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center text-gray-700">
                  <FaStar className="mr-2 text-yellow-500" />
                  Đánh giá
                </span>
                <span className="font-semibold">{story.rating || '0'}/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-700">
                  <FaList className="mr-2" />
                  Số chương
                </span>
                <span className="font-semibold">{story.chapters || '1'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={handleBookmark}
                className={`flex items-center justify-center py-2 px-4 rounded ${
                  isBookmarked
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isBookmarked ? <FaBookmark className="mr-2" /> : <FaRegBookmark className="mr-2" />}
                Đánh dấu
              </button>
              <button
                onClick={handleLike}
                className={`flex items-center justify-center py-2 px-4 rounded ${
                  isLiked
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isLiked ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
                Thích
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center py-2 px-4 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 col-span-1"
              >
                <FaShare className="mr-2" />
                Chia sẻ
              </button>
              <button
                onClick={handleReport}
                className="flex items-center justify-center py-2 px-4 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 col-span-1"
              >
                <FaExclamationTriangle className="mr-2" />
                Báo cáo
              </button>
            </div>

            {/* Rating */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Đánh giá của bạn</h3>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl text-yellow-400 mr-1"
                  >
                    {star <= (hoverRating || userRating) ? <FaStar /> : <FaRegStar />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-3/4">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Giới thiệu
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'chapters'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Danh sách chương
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`py-4 px-6 font-medium text-sm border-b-2 ${
                    activeTab === 'comments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Bình luận ({comments.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="pb-6">
              {/* Info Tab */}
              {activeTab === 'info' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Giới thiệu truyện</h2>
                  <p className="text-gray-700 mb-6 whitespace-pre-line">{story.description}</p>

                  {/* Tags */}
                  {story.tags && Array.isArray(story.tags) && story.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Thẻ</h3>
                      <div className="flex flex-wrap gap-2">
                        {story.tags.map((tag, index) => (
                          <Link
                            key={index}
                            to={`/tags/${tag.toLowerCase()}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Table */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-3">Thông tin chi tiết</h3>
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2 text-gray-600 w-1/3">Tác giả:</td>
                          <td className="py-2">{story.author}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Thể loại:</td>
                          <td className="py-2">{story.genre}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Trạng thái:</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              story.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {story.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Ngày đăng:</td>
                          <td className="py-2">{formatTime(story.createdAt)}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Cập nhật:</td>
                          <td className="py-2">{formatTime(story.updatedAt)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Related Stories */}
                  {story.relatedStories && Array.isArray(story.relatedStories) && story.relatedStories.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Truyện liên quan</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {story.relatedStories.map((relatedStory) => (
                          <a
                            key={relatedStory._id}
                            href={`/story/${relatedStory._id}`}
                            className="flex items-center bg-gray-50 rounded-lg p-2 hover:bg-gray-100"
                            onClick={(e) => {
                              e.preventDefault();
                              // Sử dụng window.location.href để tải lại trang hoàn toàn
                              window.location.href = `/story/${relatedStory._id}`;
                            }}
                          >
                            <img
                              src={relatedStory.thumbnail}
                              alt={relatedStory.title}
                              className="w-12 h-16 object-cover rounded mr-3"
                            />
                            <span className="line-clamp-2 text-sm">{relatedStory.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chapters Tab */}
              {activeTab === 'chapters' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Danh sách chương ({chapters.length})</h2>
                    <div className="flex items-center">
                      <select className="border rounded px-3 py-1 text-sm mr-2">
                        <option value="desc">Mới nhất</option>
                        <option value="asc">Cũ nhất</option>
                      </select>
                      <Link
                        to={`/story/${story._id}/chapter/${chapters[0]?.number}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm"
                      >
                        Đọc mới nhất
                      </Link>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      {chapters.slice(0, 10).map((chapter) => (
                        <Link
                          key={chapter._id}
                          to={`/story/${story._id}/chapter/${chapter.number}`}
                          className={`flex justify-between items-center p-3 hover:bg-gray-100 ${
                            chapter.isLocked ? 'text-gray-400' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            {chapter.isLocked && (
                              <span className="mr-2 text-yellow-500">🔒</span>
                            )}
                            <span className="line-clamp-1">{chapter.title}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(chapter.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {chapters.length > 10 && (
                    <div className="mt-4 text-center">
                      <Link
                        to={`/story/${story._id}/chapters`}
                        className="text-blue-600 hover:underline"
                      >
                        Xem tất cả {chapters.length} chương
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Bình luận ({comments.length})</h2>

                  {/* Comment Form */}
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex">
                      <img
                        src="https://i.pravatar.cc/150?img=1"
                        alt="Your Avatar"
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Viết bình luận của bạn..."
                          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          rows="3"
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                          <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                          >
                            Gửi bình luận
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment._id} className="flex">
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{comment.userName}</h4>
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                •••
                              </button>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <div className="mt-2 flex items-center text-sm">
                            <button className="flex items-center text-gray-500 hover:text-blue-600 mr-4">
                              <FaRegHeart className="mr-1" />
                              Thích ({comment.likes})
                            </button>
                            <button className="text-gray-500 hover:text-blue-600">
                              Trả lời
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="bg-gray-100 p-4 flex justify-center">
        <Link
          to={`/story/${story._id}/chapter/1`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium"
        >
          Đọc từ đầu
        </Link>
        {chapters.length > 0 && (
          <Link
            to={`/story/${story._id}/chapter/${chapters[0]?.number}`}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium ml-4"
          >
            Đọc mới nhất
          </Link>
        )}
      </div>
    </div>
  );
};

export default StoryDetail;
