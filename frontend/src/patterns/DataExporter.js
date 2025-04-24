/**
 * DataExporter - Lớp cơ sở cho việc xuất dữ liệu
 * Triển khai Template Method Pattern
 */
export default class DataExporter {
  /**
   * Phương thức template định nghĩa thuật toán xuất dữ liệu
   * @param {Array} data - Dữ liệu cần xuất
   */
  export(data) {
    // Bước 1: Chuẩn bị dữ liệu (bước chung)
    this.prepareData(data);
    
    // Bước 2: Định dạng dữ liệu (bước trừu tượng, do lớp con triển khai)
    const formattedData = this.formatData(data);
    
    // Bước 3: Lưu dữ liệu (bước trừu tượng, do lớp con triển khai)
    this.saveData(formattedData);
    
    // Bước 4: Hoàn thành xuất dữ liệu (bước chung)
    this.completeExport();
  }

  /**
   * Chuẩn bị dữ liệu trước khi xuất (bước chung)
   * @param {Array} data - Dữ liệu cần chuẩn bị
   */
  prepareData(data) {
    console.log('Đang chuẩn bị dữ liệu để xuất...');
    // Có thể ghi đè phương thức này nếu cần
  }

  /**
   * Định dạng dữ liệu (bước trừu tượng)
   * @param {Array} data - Dữ liệu cần định dạng
   * @returns {*} Dữ liệu đã được định dạng
   */
  formatData(data) {
    throw new Error('Phương thức "formatData" phải được triển khai bởi lớp con');
  }

  /**
   * Lưu dữ liệu (bước trừu tượng)
   * @param {*} formattedData - Dữ liệu đã được định dạng
   */
  saveData(formattedData) {
    throw new Error('Phương thức "saveData" phải được triển khai bởi lớp con');
  }

  /**
   * Hoàn thành xuất dữ liệu (bước chung)
   */
  completeExport() {
    console.log('Xuất dữ liệu hoàn tất!');
    // Có thể ghi đè phương thức này nếu cần
  }
}
