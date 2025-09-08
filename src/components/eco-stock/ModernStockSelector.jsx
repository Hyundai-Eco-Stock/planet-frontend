import React, { useState, useRef, useEffect } from 'react';

const ModernStockSelector = ({ stockList, selectedStockId, onStockChange, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const selectedStock = stockList?.find(stock => stock.id === selectedStockId);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleSelect = (stockId) => {
        onStockChange(stockId);
        setIsOpen(false);
    };
    
    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            {/* 주식명처럼 보이는 버튼 */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={`
                    flex items-center text-xl font-bold text-gray-900 min-w-0
                    ${disabled ? 'cursor-not-allowed' : 'hover:text-blue-600 cursor-pointer'}
                    transition-colors
                `}
            >
                <span className="truncate whitespace-nowrap overflow-hidden">
                    {selectedStock?.name || '주식 선택'}
                </span>
                <svg className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            
            {/* 드롭다운 목록 */}
            {isOpen && !disabled && (
                <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden">
                    {stockList && stockList.length > 0 ? (
                        stockList.map((stock) => (
                            <button
                                key={stock.id}
                                onClick={() => handleSelect(stock.id)}
                                className={`
                                    w-full px-3 py-2 text-left text-sm truncate
                                    ${selectedStockId === stock.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50'}
                                `}
                            >
                                {stock.name}
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-4 text-center text-gray-500 text-sm">
                            주식이 없습니다
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ModernStockSelector;