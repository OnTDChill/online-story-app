import DataExporter from './DataExporter';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * PDFExporter - Lớp xuất dữ liệu sang định dạng PDF
 * Triển khai cụ thể của Template Method Pattern
 */
export default class PDFExporter extends DataExporter {
  /**
   * Định dạng dữ liệu thành đối tượng PDF
   * @param {Array} data - Dữ liệu cần định dạng
   * @returns {Object} Đối tượng chứa dữ liệu đã định dạng cho PDF
   */
  formatData(data) {
    // Kiểm tra nếu data không phải là mảng hoặc rỗng
    if (!Array.isArray(data) || data.length === 0) {
      return { headers: [], rows: [] };
    }

    // Lấy tên các cột từ đối tượng đầu tiên
    const headers = Object.keys(data[0]);
    
    // Tạo mảng dữ liệu cho từng dòng
    const rows = data.map(item => 
      headers.map(header => {
        const value = item[header];
        return value !== null && value !== undefined ? value.toString() : '';
      })
    );
    
    return { headers, rows };
  }

  /**
   * Lưu dữ liệu dưới dạng PDF
   * @param {Object} formattedData - Dữ liệu đã định dạng cho PDF
   */
  saveData(formattedData) {
    const { headers, rows } = formattedData;
    
    // Tạo đối tượng PDF
    const doc = new jsPDF();
    
    // Thêm tiêu đề
    doc.setFontSize(18);
    doc.text('Exported Data', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    
    // Thêm bảng dữ liệu
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Lưu file PDF
    doc.save(`export_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  /**
   * Ghi đè phương thức chuẩn bị dữ liệu để xử lý đặc biệt cho PDF
   * @param {Array} data - Dữ liệu cần chuẩn bị
   */
  prepareData(data) {
    console.log('Đang chuẩn bị dữ liệu cho PDF...');
    
    // Kiểm tra nếu thư viện jsPDF đã được cài đặt
    if (typeof jsPDF === 'undefined') {
      console.warn('Thư viện jsPDF chưa được cài đặt. Vui lòng cài đặt bằng lệnh: npm install jspdf jspdf-autotable');
    }
  }
}
