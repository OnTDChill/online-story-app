import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ExcelExporter from '../../patterns/ExcelExporter';
import PDFExporter from '../../patterns/PDFExporter';
import CSVExporter from '../../patterns/CSVExporter';

/**
 * Component xuất dữ liệu doanh thu
 * Sử dụng Template Method Pattern
 */
const RevenueExport = ({ token }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [viewType, setViewType] = useState('day'); // 'day', 'month', 'year'

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Lấy dữ liệu doanh thu
  useEffect(() => {
    fetchRevenueData();
  }, [viewType]);

  // Lấy dữ liệu doanh thu từ API
  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}admin/revenue`, {
        params: {
          viewType,
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setRevenueData(response.data);
      } else {
        toast.error('Không thể lấy dữ liệu doanh thu');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      toast.error('Lỗi khi lấy dữ liệu doanh thu');
      
      // Dữ liệu mẫu để test
      setRevenueData(generateSampleData());
    } finally {
      setLoading(false);
    }
  };

  // Tạo dữ liệu mẫu để test
  const generateSampleData = () => {
    const data = [];
    const today = new Date();
    
    if (viewType === 'day') {
      // Dữ liệu theo ngày trong 30 ngày gần nhất
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 1000000) + 100000,
          transactions: Math.floor(Math.random() * 100) + 10,
          newUsers: Math.floor(Math.random() * 50) + 5
        });
      }
    } else if (viewType === 'month') {
      // Dữ liệu theo tháng trong 12 tháng gần nhất
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(today.getMonth() - i);
        
        data.push({
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          revenue: Math.floor(Math.random() * 10000000) + 1000000,
          transactions: Math.floor(Math.random() * 1000) + 100,
          newUsers: Math.floor(Math.random() * 500) + 50
        });
      }
    } else {
      // Dữ liệu theo năm trong 5 năm gần nhất
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setFullYear(today.getFullYear() - i);
        
        data.push({
          date: `${date.getFullYear()}`,
          revenue: Math.floor(Math.random() * 100000000) + 10000000,
          transactions: Math.floor(Math.random() * 10000) + 1000,
          newUsers: Math.floor(Math.random() * 5000) + 500
        });
      }
    }
    
    return data;
  };

  // Xử lý thay đổi khoảng thời gian
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  // Xử lý thay đổi loại xem
  const handleViewTypeChange = (e) => {
    setViewType(e.target.value);
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    fetchRevenueData();
  };

  // Xử lý xuất dữ liệu
  const handleExport = (format) => {
    if (revenueData.length === 0) {
      toast.warning('Không có dữ liệu để xuất');
      return;
    }

    let exporter;
    
    // Sử dụng Template Method Pattern để xuất dữ liệu
    switch (format) {
      case 'excel':
        exporter = new ExcelExporter();
        break;
      case 'pdf':
        exporter = new PDFExporter();
        break;
      case 'csv':
        exporter = new CSVExporter();
        break;
      default:
        toast.error('Định dạng xuất không hợp lệ');
        return;
    }
    
    try {
      // Định dạng dữ liệu trước khi xuất
      const formattedData = revenueData.map(item => ({
        'Ngày/Tháng/Năm': item.date,
        'Doanh thu': item.revenue.toLocaleString('vi-VN') + ' VND',
        'Số giao dịch': item.transactions,
        'Người dùng mới': item.newUsers
      }));
      
      // Sử dụng phương thức template để xuất dữ liệu
      exporter.export(formattedData);
      
      toast.success(`Xuất dữ liệu ${format.toUpperCase()} thành công!`);
    } catch (error) {
      console.error(`Lỗi khi xuất dữ liệu ${format}:`, error);
      toast.error(`Lỗi khi xuất dữ liệu ${format}`);
    }
  };

  // Format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6 pt-0 flex-1 relative">
      <h3 className="text-2xl font-semibold mb-4">Báo cáo doanh thu</h3>
      
      {/* Bộ lọc */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại xem</label>
            <select
              value={viewType}
              onChange={handleViewTypeChange}
              className="w-full p-2 border rounded"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
      
      {/* Nút xuất dữ liệu */}
      <div className="mb-4 flex gap-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => handleExport('excel')}
        >
          Xuất Excel
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => handleExport('pdf')}
        >
          Xuất PDF
        </button>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          onClick={() => handleExport('csv')}
        >
          Xuất CSV
        </button>
      </div>
      
      {/* Bảng dữ liệu */}
      {loading ? (
        <div className="text-center py-4">Đang tải dữ liệu...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">{viewType === 'day' ? 'Ngày' : viewType === 'month' ? 'Tháng' : 'Năm'}</th>
                <th className="p-2 border">Doanh thu</th>
                <th className="p-2 border">Số giao dịch</th>
                <th className="p-2 border">Người dùng mới</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.length > 0 ? (
                revenueData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="p-2 border text-center">{item.date}</td>
                    <td className="p-2 border text-right">{formatCurrency(item.revenue)}</td>
                    <td className="p-2 border text-center">{item.transactions}</td>
                    <td className="p-2 border text-center">{item.newUsers}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RevenueExport;
