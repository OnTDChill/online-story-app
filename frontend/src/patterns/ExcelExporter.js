import DataExporter from './DataExporter';
import * as XLSX from 'xlsx';

/**
 * ExcelExporter - Lớp xuất dữ liệu sang định dạng Excel
 * Triển khai cụ thể của Template Method Pattern
 */
export default class ExcelExporter extends DataExporter {
  /**
   * Định dạng dữ liệu thành workbook Excel
   * @param {Array} data - Dữ liệu cần định dạng
   * @returns {XLSX.WorkBook} Workbook Excel
   */
  formatData(data) {
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Tạo workbook và thêm worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    return workbook;
  }

  /**
   * Lưu workbook Excel
   * @param {XLSX.WorkBook} workbook - Workbook Excel cần lưu
   */
  saveData(workbook) {
    // Tạo tên file với timestamp
    const fileName = `export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // Xuất file Excel
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Ghi đè phương thức chuẩn bị dữ liệu để xử lý đặc biệt cho Excel
   * @param {Array} data - Dữ liệu cần chuẩn bị
   */
  prepareData(data) {
    console.log('Đang chuẩn bị dữ liệu cho Excel...');
    
    // Kiểm tra nếu thư viện XLSX đã được cài đặt
    if (typeof XLSX === 'undefined') {
      console.warn('Thư viện XLSX chưa được cài đặt. Vui lòng cài đặt bằng lệnh: npm install xlsx');
    }
  }
}
