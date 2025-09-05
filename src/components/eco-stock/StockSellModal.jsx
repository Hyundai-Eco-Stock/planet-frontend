import React, { useState, useEffect } from 'react';

const StockSellModal = ({ 
  isOpen, 
  onClose, 
  stockInfo, 
  stock, 
  onConfirm,
  formatCurrency 
}) => {
  const [sellQuantity, setSellQuantity] = useState(stock.quantity || 0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSellQuantity(stock.quantity || 0);
      setError('');
    }
  }, [isOpen, stock.quantity]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setSellQuantity(value);
    
    if (value <= 0) {
      setError('올바른 수량을 입력해주세요');
    } else if (value > stock.quantity) {
      setError(`최대 ${stock.quantity}주까지 판매 가능합니다`);
    } else {
      setError('');
    }
  };

  const handleConfirm = () => {
    if (error || sellQuantity <= 0 || sellQuantity > stock.quantity) {
      return;
    }
    onConfirm(sellQuantity);
  };

  const expectedPoints = sellQuantity * (stock.currentPrice || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
          판매 수량 입력
        </h2>
        
        <div className="mb-6">
          <p className="text-center text-gray-700 mb-4">
            보유 중인 <strong>{stockInfo?.name || '에코스톡'}</strong>{' '}
            <strong>{stock.quantity}주</strong>
          </p>
          
          <label className="block font-bold text-gray-700 mb-2">
            판매할 수량
          </label>
          
          <input
            type="number"
            min="1"
            max={stock.quantity}
            value={sellQuantity}
            onChange={handleQuantityChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          
          <p className="text-center text-gray-600 text-sm mt-3">
            현재가: {formatCurrency(stock.currentPrice)} 포인트
          </p>
          
          <p className="text-center text-green-600 font-bold text-lg mt-3">
            예상 획득 포인트: {formatCurrency(expectedPoints)} 포인트
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!!error || sellQuantity <= 0}
            className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
          >
            판매하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockSellModal;