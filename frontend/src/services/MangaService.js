const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

export const MangaService = {
  // Lấy danh sách truyện
  async getMangas() {
    try {
      // Thử lấy từ API trước
      const response = await fetch(`${API_URL}stories`);
      if (response.ok) {
        return await response.json();
      }
      
      // Nếu không có API, lấy từ dữ liệu local
      const mangas = [];
      const mangaIds = ['one-piece', 'naruto'];
      
      for (const id of mangaIds) {
        try {
          const info = await fetch(`/data/manga/${id}/info.json`);
          if (info.ok) {
            mangas.push(await info.json());
          }
        } catch (error) {
          console.error(`Error loading manga ${id}:`, error);
        }
      }
      
      return mangas;
    } catch (error) {
      console.error('Error fetching mangas:', error);
      return [];
    }
  },
  
  // Lấy thông tin chi tiết truyện
  async getManga(id) {
    try {
      // Thử lấy từ API trước
      const response = await fetch(`${API_URL}stories/${id}`);
      if (response.ok) {
        return await response.json();
      }
      
      // Nếu không có API, lấy từ dữ liệu local
      const info = await fetch(`/data/manga/${id}/info.json`);
      if (info.ok) {
        return await info.json();
      }
      
      throw new Error('Manga not found');
    } catch (error) {
      console.error(`Error fetching manga ${id}:`, error);
      return null;
    }
  },
  
  // Lấy danh sách chương của truyện
  async getChapters(id) {
    try {
      // Thử lấy từ API trước
      const response = await fetch(`${API_URL}stories/${id}/chapters`);
      if (response.ok) {
        return await response.json();
      }
      
      // Nếu không có API, lấy từ dữ liệu local
      const chapters = await fetch(`/data/manga/${id}/chapters.json`);
      if (chapters.ok) {
        return await chapters.json();
      }
      
      throw new Error('Chapters not found');
    } catch (error) {
      console.error(`Error fetching chapters for manga ${id}:`, error);
      return [];
    }
  },
  
  // Lấy nội dung của một chương
  async getChapter(mangaId, chapterNumber) {
    try {
      // Thử lấy từ API trước
      const response = await fetch(`${API_URL}stories/${mangaId}/chapters/${chapterNumber}`);
      if (response.ok) {
        return await response.json();
      }
      
      // Nếu không có API, lấy từ dữ liệu local
      const chapters = await fetch(`/data/manga/${mangaId}/chapters.json`);
      if (chapters.ok) {
        const allChapters = await chapters.json();
        return allChapters.find(ch => ch.number === parseInt(chapterNumber));
      }
      
      throw new Error('Chapter not found');
    } catch (error) {
      console.error(`Error fetching chapter ${chapterNumber} for manga ${mangaId}:`, error);
      return null;
    }
  }
};

export default MangaService;