/**
 * BasicGenre - Lớp cơ bản cho thể loại truyện
 */
export class BasicGenre {
  /**
   * Khởi tạo thể loại cơ bản
   * @param {Object} genre - Đối tượng thể loại
   */
  constructor(genre) {
    this.id = genre.id || genre._id;
    this.name = genre.name;
  }

  /**
   * Lấy tên thể loại
   * @returns {string} Tên thể loại
   */
  getName() {
    return this.name;
  }

  /**
   * Lấy ID thể loại
   * @returns {string} ID thể loại
   */
  getId() {
    return this.id;
  }

  /**
   * Lấy thông tin thể loại dưới dạng đối tượng
   * @returns {Object} Thông tin thể loại
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name
    };
  }
}

/**
 * GenreWithCountDecorator - Decorator thêm số lượng truyện vào thể loại
 * Triển khai Decorator Pattern
 */
export class GenreWithCountDecorator {
  /**
   * Khởi tạo decorator với thể loại cần trang trí
   * @param {BasicGenre} genre - Thể loại cần trang trí
   */
  constructor(genre) {
    this.genre = genre;
    this.storyCount = 0;
  }

  /**
   * Lấy tên thể loại kèm số lượng truyện
   * @returns {string} Tên thể loại kèm số lượng
   */
  getName() {
    return `${this.genre.getName()} (${this.storyCount})`;
  }

  /**
   * Lấy ID thể loại (chuyển tiếp đến đối tượng gốc)
   * @returns {string} ID thể loại
   */
  getId() {
    return this.genre.getId();
  }

  /**
   * Thiết lập số lượng truyện
   * @param {number} count - Số lượng truyện
   * @returns {GenreWithCountDecorator} Instance hiện tại để hỗ trợ method chaining
   */
  setStoryCount(count) {
    this.storyCount = count;
    return this;
  }

  /**
   * Lấy số lượng truyện
   * @returns {number} Số lượng truyện
   */
  getStoryCount() {
    return this.storyCount;
  }

  /**
   * Lấy thông tin thể loại dưới dạng đối tượng
   * @returns {Object} Thông tin thể loại
   */
  getInfo() {
    return {
      ...this.genre.getInfo(),
      storyCount: this.storyCount
    };
  }
}

/**
 * GenreWithPopularityDecorator - Decorator thêm độ phổ biến vào thể loại
 * Triển khai Decorator Pattern
 */
export class GenreWithPopularityDecorator {
  /**
   * Khởi tạo decorator với thể loại cần trang trí
   * @param {BasicGenre|GenreWithCountDecorator} genre - Thể loại cần trang trí
   */
  constructor(genre) {
    this.genre = genre;
    this.popularity = 0; // 0-5 stars
  }

  /**
   * Lấy tên thể loại kèm độ phổ biến
   * @returns {string} Tên thể loại kèm độ phổ biến
   */
  getName() {
    const stars = '★'.repeat(Math.floor(this.popularity)) + '☆'.repeat(5 - Math.floor(this.popularity));
    return `${this.genre.getName()} ${stars}`;
  }

  /**
   * Lấy ID thể loại (chuyển tiếp đến đối tượng gốc)
   * @returns {string} ID thể loại
   */
  getId() {
    return this.genre.getId();
  }

  /**
   * Thiết lập độ phổ biến
   * @param {number} value - Độ phổ biến (0-5)
   * @returns {GenreWithPopularityDecorator} Instance hiện tại để hỗ trợ method chaining
   */
  setPopularity(value) {
    this.popularity = Math.max(0, Math.min(5, value));
    return this;
  }

  /**
   * Lấy độ phổ biến
   * @returns {number} Độ phổ biến
   */
  getPopularity() {
    return this.popularity;
  }

  /**
   * Lấy số lượng truyện (nếu có)
   * @returns {number|undefined} Số lượng truyện hoặc undefined
   */
  getStoryCount() {
    return this.genre.getStoryCount ? this.genre.getStoryCount() : undefined;
  }

  /**
   * Lấy thông tin thể loại dưới dạng đối tượng
   * @returns {Object} Thông tin thể loại
   */
  getInfo() {
    return {
      ...this.genre.getInfo(),
      popularity: this.popularity
    };
  }
}

/**
 * Tạo thể loại với đầy đủ thông tin
 * @param {Object} genre - Đối tượng thể loại gốc
 * @param {number} count - Số lượng truyện
 * @param {number} popularity - Độ phổ biến
 * @returns {GenreWithPopularityDecorator} Thể loại đã được trang trí
 */
export function createFullGenre(genre, count, popularity) {
  const basicGenre = new BasicGenre(genre);
  const genreWithCount = new GenreWithCountDecorator(basicGenre).setStoryCount(count);
  return new GenreWithPopularityDecorator(genreWithCount).setPopularity(popularity);
}
