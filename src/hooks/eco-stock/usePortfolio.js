import { useState, useMemo, useCallback, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getPersonalStockInfo } from '@/api/memberStockInfo/memberStockInfo.api';
import { stockSell } from '@/api/stockSell/stockSell.api';
import useAuthStore from '@/store/authStore';

// 개인 주식 정보 조회 훅
export const usePersonalStockInfo = (stockId) => {
    const [memberStockInfo, setMemberStockInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { loginStatus } = useAuthStore(); 

    const fetchPersonalStockInfo = useCallback(async () => {
        if (!stockId) {
            setMemberStockInfo(null);
            setIsLoading(false);
            return;
        }
        if(!loginStatus){
            return;
        }

        setIsLoading(true);
        try {
            const stockData = await getPersonalStockInfo(stockId);
            setMemberStockInfo(stockData);
        } catch (err) {
            console.error('주식 정보 조회 실패:', err);
            setMemberStockInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, [stockId]);

    useEffect(() => {
        fetchPersonalStockInfo();
    }, [fetchPersonalStockInfo]);

    return {
        memberStockInfo,
        isLoading,
        refetch: fetchPersonalStockInfo
    };
};

// 주식 계산 훅
export const useStockCalculations = (currentData, memberStockInfo, isLoading) => {
    return useMemo(() => {
        if (!memberStockInfo || isLoading) {
            return { quantity: 0, isEmpty: true, availablePoints: 0 };
        }

        const currentPrice = currentData?.ohlcData?.close || 0;
        const { currentTotalQuantity: quantity, currentTotalAmount: purchaseValue, point } = memberStockInfo;

        if (!quantity || quantity === 0) {
            return {
                quantity: 0,
                isEmpty: true,
                availablePoints: point || 0
            };
        }

        const purchasePrice = purchaseValue / quantity;
        const currentValue = quantity * currentPrice;
        const profitLoss = currentValue - purchaseValue;
        const profitPercent = purchaseValue > 0 ? (profitLoss / purchaseValue) * 100 : 0;

        return {
            quantity,
            currentPrice,
            purchasePrice,
            currentValue,
            purchaseValue,
            profitLoss,
            profitPercent,
            availablePoints: point || 0,
            isEmpty: false
        };
    }, [currentData, memberStockInfo, isLoading]);
};

// 주식 판매 훅
export const useStockSell = (stockInfo, stock, onSell, onSuccess) => {
    const [isSelling, setIsSelling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSell = useCallback(() => {
        if (stock.isEmpty || stock.quantity === 0) return;
        setIsModalOpen(true);
    }, [stock]);

    const handleConfirmSell = useCallback(async (sellQuantity) => {
        setIsModalOpen(false);
        setIsSelling(true);

        const expectedPoints = sellQuantity * stock.currentPrice;

        try {
            const sellStockRequest = {
                ecoStockId: stockInfo.id,
                sellPrice: stock.currentPrice,
                sellCount: sellQuantity
            };

            const result = await stockSell(sellStockRequest);
            console.log(result);
            
            if (onSell) {
                await onSell(sellStockRequest);
            }

            await Swal.fire({
                title: '교환 완료!',
                html: `
                    <p><strong>${sellQuantity}주</strong> 교환이 완료되었습니다.</p>
                    <p style="color: #22c55e; font-weight: bold;">
                        획득 포인트: ${formatCurrency(expectedPoints)} 포인트
                    </p>
                `,
                icon: 'success',
                confirmButtonText: '확인',
                confirmButtonColor: '#22c55e'
            });

            if (onSuccess) {
                await onSuccess();
            }
        } catch (error) {
            console.error('교환 실패:', error);
            await Swal.fire({
                title: '오류',
                text: error.message || '교환 처리 중 오류가 발생했습니다.',
                icon: 'error',
                confirmButtonText: '확인',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSelling(false);
        }
    }, [stock, stockInfo, onSell, onSuccess]);

    return {
        isSelling,
        isModalOpen,
        handleSell,
        handleConfirmSell,
        closeModal: () => setIsModalOpen(false)
    };
};


// 포맷팅 함수들
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0';
    return new Intl.NumberFormat('ko-KR').format(Math.round(amount));
};

export const formatPercent = (percent) => {
    if (percent === undefined || percent === null || isNaN(percent)) return '0.00%';
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
};