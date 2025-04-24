import DataExporter from './DataExporter';

/**
 * CSVExporter - Lớp xuất dữ liệu sang định dạng CSV
 * Triển khai cụ thể của Template Method Pattern
 */
export default class CSVExporter extends DataExporter {
  /**
   * Định dạng dữ liệu thành CSV
   * @param {Array} data - Dữ liệu cần định dạng
   * @returns {string} Chuỗi CSV
   */
  formatData(data) {
    // Kiểm tra nếu data không phải là mảng hoặc rỗng
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    // Lấy tên các cột từ đối tượng đầu tiên
    const headers = Object.keys(data[0]);
    
    // Tạo dòng tiêu đề
    let csv = headers.join(',') + '\\n';
    
    // Thêm dữ liệu từng dòng
    data.forEach(item => {
      const row = headers.map(header => {
        // Xử lý giá trị để tránh lỗi CSV
        let value = item[header] === null || item[header] === undefined ? '' : item[header];
        
        // Nếu là chuỗi, bọc trong dấu ngoặc kép và escape dấu ngoặc kép bên trong
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          value = `"${value}"`;
        }
        
        return value;
      }).join(',');
      
      csv += row + '\\n';
    });
    
    return csv;
  }

  /**
   * Lưu dữ liệu CSV
   * @param {string} csv - Chuỗi CSV cần lưu
   */
  saveData(csv) {
    // Tạo Blob từ chuỗi CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    // Tạo URL cho Blob
    const url = URL.createObjectURL(blob);
    
    // Tạo phần tử a để tải xuống
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${new Date().toISOString().slice(0, 10)}.csv`);
    
    // Thêm link vào DOM, kích hoạt sự kiện click, và xóa link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Giải phóng URL
    URL.revokeObjectURL(url);
  }
}
