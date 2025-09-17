import React, { useState, useEffect } from 'react';

const StockSellModal = ({ 
  isOpen, 
  onClose, 
  stockInfo, 
  stock, 
  onConfirm,
  formatCurrency 
}) => {
  const [sellQuantity, setSellQuantity] = useState(
    stock.quantity ? String(stock.quantity) : ''
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSellQuantity(stock.quantity ? String(stock.quantity) : '');
      setError('');
    }
  }, [isOpen, stock.quantity]);

  const handleQuantityChange = (e) => {
    let value = e.target.value;

    // 입력이 비어 있으면 상태만 비웁니다.
    if (value === '') {
      setSellQuantity('');
      setError('');
      return;
    }

    // 숫자가 아닌 문자 제거
    value = value.replace(/[^0-9]/g, '');

    if (value === '') {
      setSellQuantity('');
      setError('');
      return;
    }

    // 맨 앞의 0들 제거 (단, "0"만 있는 경우는 제외)
    value = value.replace(/^0+/, '') || '0';

    const numValue = parseInt(value, 10) || 0;
    setSellQuantity(value);

    if (numValue <= 0) {
      setError('올바른 수량을 입력해주세요');
    } else if (numValue > stock.quantity) {
      setError(`최대 ${stock.quantity}주까지 판매 가능합니다`);
    } else {
      setError('');
    }
  };

  const handleConfirm = () => {
    const numValue = sellQuantity ? parseInt(sellQuantity, 10) : 0;

    if (error || numValue <= 0 || numValue > stock.quantity) {
      return;
    }
    onConfirm(numValue);
  };

  const numericSellQuantity = sellQuantity ? parseInt(sellQuantity, 10) : 0;
  const expectedPoints = numericSellQuantity * (stock.currentPrice || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white text-center">
            포인트로 교환
          </h2>
          <p className="text-emerald-100 text-center text-sm mt-1">
            판매할 수량을 입력해주세요
          </p>
        </div>
        
        {/* 본문 */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold text-emerald-600">{stockInfo?.name || '에코스톡'}</span> 보유량
              </p>
              <p className="text-2xl font-bold text-gray-900">{stock.quantity}주</p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-3">
              판매할 수량
            </label>
            
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={sellQuantity}
                onChange={handleQuantityChange}
                className="w-full p-4 border border-gray-200 rounded-xl text-center text-xl font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="수량 입력"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                주
              </div>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}
          </div>
          
          {/* 가격 정보 */}
          <div className="bg-emerald-50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">현재가</span>
              <span className="font-semibold">{formatCurrency(stock.currentPrice)} 포인트</span>
            </div>
            <div className="border-t border-emerald-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">예상 획득 포인트</span>
                <span className="text-xl font-bold text-emerald-600">{formatCurrency(expectedPoints)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 버튼 */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!!error || numericSellQuantity <= 0}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
          >
            교환하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockSellModal;
