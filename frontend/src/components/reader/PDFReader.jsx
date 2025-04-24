import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FaArrowLeft, FaArrowRight, FaDownload, FaHome } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

// Cấu hình worker cho react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDFReader - Component để hiển thị và đọc file PDF
 */
const PDFReader = ({ pdfUrl, title, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const navigate = useNavigate();

  // Xử lý khi tài liệu PDF được tải thành công
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Chuyển đến trang trước
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  // Chuyển đến trang tiếp theo
  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // Phóng to
  const zoomIn = () => {
    setScale(scale + 0.1);
  };

  // Thu nhỏ
  const zoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.1);
    }
  };

  // Quay về trang chủ
  const handleGoHome = () => {
    navigate('/');
  };

  // Quay về trang chi tiết truyện
  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <button 
            onClick={handleBack}
            className="mr-4 text-gray-300 hover:text-white"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold truncate">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleGoHome}
            className="text-gray-300 hover:text-white"
          >
            <FaHome className="text-xl" />
          </button>
          <a 
            href={pdfUrl} 
            download
            className="text-gray-300 hover:text-white"
          >
            <FaDownload className="text-xl" />
          </a>
        </div>
      </header>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
          error={
            <div className="text-center text-red-500 p-4">
              <p>Không thể tải file PDF. Vui lòng thử lại sau.</p>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
          />
        </Document>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex flex-wrap justify-center items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={zoomOut}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
          >
            -
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button 
            onClick={zoomIn}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
          >
            +
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className={`px-3 py-1 rounded ${pageNumber <= 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <FaArrowLeft />
          </button>
          <span>
            Trang {pageNumber} / {numPages || '--'}
          </span>
          <button 
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className={`px-3 py-1 rounded ${pageNumber >= numPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFReader;
