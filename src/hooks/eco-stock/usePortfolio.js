import { useState, useMemo, useCallback, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getPersonalStockInfo } from '@/api/memberStockInfo/memberStockInfo.api';
import { stockSell } from '@/api/stockSell/stockSell.api';

// 개인 주식 정보 조회 훅
export const usePersonalStockInfo = (stockId) => {
    const [memberStockInfo, setMemberStockInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPersonalStockInfo = useCallback(async () => {
        if (!stockId) {
            setMemberStockInfo(null);
            setIsLoading(false);
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

    const handleSell = useCallback(async () => {
        if (stock.isEmpty || stock.quantity === 0) return;

        const { value: sellQuantity } = await Swal.fire({
            title: '판매 수량 입력',
            html: `
                <div>
                    <p>보유 중인 <strong>${stockInfo?.name || '에코스톡'}</strong> <strong>${stock.quantity}주</strong></p>
                    <label style="font-weight: bold; margin-bottom: 10px; display: block;">판매할 수량</label>
                    <input 
                        id="sellQuantity" 
                        type="number" 
                        min="1" 
                        max="${stock.quantity}" 
                        value="${stock.quantity}"
                        style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; text-align: center;"
                    />
                    <p style="margin-top: 10px; color: #666; font-size: 14px;">
                        현재가: ${formatCurrency(stock.currentPrice)} 포인트
                    </p>
                    <p id="expectedPoints" style="margin-top: 10px; color: #22c55e; font-weight: bold; font-size: 16px;">
                        예상 획득 포인트: ${formatCurrency(stock.quantity * stock.currentPrice)} 포인트
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280',
            confirmButtonText: '판매하기',
            cancelButtonText: '취소',
            didOpen: () => {
                const input = document.getElementById('sellQuantity');
                const pointsDisplay = document.getElementById('expectedPoints');

                input.addEventListener('input', (e) => {
                    const quantity = parseInt(e.target.value) || 0;
                    const expectedPoints = quantity * stock.currentPrice;
                    pointsDisplay.textContent = `예상 획득 포인트: ${formatCurrency(expectedPoints)} 포인트`;
                });
            },
            preConfirm: () => {
                const quantity = parseInt(document.getElementById('sellQuantity').value);
                if (!quantity || quantity <= 0) {
                    Swal.showValidationMessage('올바른 수량을 입력해주세요');
                    return false;
                }
                if (quantity > stock.quantity) {
                    Swal.showValidationMessage(`최대 ${stock.quantity}주까지 판매 가능합니다`);
                    return false;
                }
                return quantity;
            }
        });

        if (!sellQuantity) return;

        const expectedPoints = sellQuantity * stock.currentPrice;
        setIsSelling(true);

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
        handleSell
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