import React, { useState, useEffect } from 'react';
import { FaChartLine, FaCalendarAlt, FaFilter, FaFileExport } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * RevenueReports - Trang báo cáo doanh thu
 */
const RevenueReports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

  // Khởi tạo ngày
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(formatDate(thirtyDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Trong thực tế, bạn sẽ gọi API
      // Ở đây chúng ta sẽ tạo dữ liệu mẫu
      
      // Giả lập gọi API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tạo dữ liệu mẫu
      const sampleData = generateSampleData(startDate, endDate, period);
      setRevenueData(sampleData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      toast.error('Không thể lấy dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  // Tạo dữ liệu mẫu
  const generateSampleData = (start, end, periodType) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const result = [];
    
    let current = new Date(startDate);
    
    while (current <= endDate) {
      const date = new Date(current);
      
      if (periodType === 'day') {
        result.push({
          date: formatDate(date),
          total: Math.floor(Math.random() * 1000) + 100,
          count: Math.floor(Math.random() * 50) + 5
        });
        current.setDate(current.getDate() + 1);
      } else if (periodType === 'month') {
        result.push({
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
          total: Math.floor(Math.random() * 10000) + 1000,
          count: Math.floor(Math.random() * 200) + 50
        });
        current.setMonth(current.getMonth() + 1);
      } else if (periodType === 'year') {
        result.push({
          date: `${date.getFullYear()}`,
          total: Math.floor(Math.random() * 100000) + 10000,
          count: Math.floor(Math.random() * 1000) + 200
        });
        current.setFullYear(current.getFullYear() + 1);
      }
    }
    
    return result;
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [startDate, endDate, period]);

  // Tính tổng doanh thu
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.total, 0);
  const totalTransactions = revenueData.reduce((sum, item) => sum + item.count, 0);

  // Xử lý xuất dữ liệu
  const handleExport = () => {
    toast.info('Đang xuất dữ liệu...');
    // Trong thực tế, bạn sẽ tạo và tải xuống file CSV/Excel
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <FaChartLine className="mr-2" /> Báo cáo doanh thu
      </h2>
      
      {/* Filters */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchRevenueData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaFilter className="mr-2" /> Lọc dữ liệu
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Tổng doanh thu</h3>
          <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
          <p className="text-sm mt-2 text-blue-100">
            <FaCalendarAlt className="inline mr-1" /> {startDate} - {endDate}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Tổng giao dịch</h3>
          <p className="text-3xl font-bold">{totalTransactions.toLocaleString()}</p>
          <p className="text-sm mt-2 text-green-100">
            <FaCalendarAlt className="inline mr-1" /> {startDate} - {endDate}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Trung bình mỗi giao dịch</h3>
          <p className="text-3xl font-bold">
            ${totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}
          </p>
          <p className="text-sm mt-2 text-purple-100">
            <FaCalendarAlt className="inline mr-1" /> {startDate} - {endDate}
          </p>
        </div>
      </div>
      
      {/* Revenue Data Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Chi tiết doanh thu</h3>
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
          >
            <FaFileExport className="mr-1" /> Xuất dữ liệu
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : revenueData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {period === 'day' ? 'Ngày' : period === 'month' ? 'Tháng' : 'Năm'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số giao dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trung bình
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                      ${item.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${(item.total / item.count).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Không có dữ liệu cho khoảng thời gian đã chọn
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueReports;
