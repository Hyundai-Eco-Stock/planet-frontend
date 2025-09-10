import { memo, useMemo, useState } from "react";
import CountdownTimer from "./CountdownTimer";
import useAuthStore from "@/store/authStore";

const RaffleCard = ({ item, onButtonClick, personalStockInfoList }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const { loginStatus } = useAuthStore.getState();
    
    // 정확한 종료 시간 계산
    const endDateObj = useMemo(() => {
        const date = new Date(item.endDate);
        date.setHours(23, 59, 59, 999); // 23:59:59.999로 설정
        return date;
    }, [item.endDate]);
    
    const userStock = useMemo(
        () => (personalStockInfoList || []).find(s => s.ecoStockName === item.ecoStockName),
        [personalStockInfoList, item.ecoStockName]
    );

    const currentQuantity = userStock?.currentTotalQuantity ?? 0;
    const hasEnoughStock = currentQuantity >= item.ecoStockAmount;
    const hasWinner = !!item.winnerName;
    const isExpired = new Date() > endDateObj;
    const isActive = !hasWinner && !isExpired;

    return (
        <div className={`rounded-xl overflow-hidden border transition-all duration-200 ${
            isActive 
                ? 'bg-white border-gray-200 hover:shadow-lg hover:border-gray-300' 
                : 'bg-gray-100 border-gray-300'
        }`}>
            {/* 이미지 영역 */}
            <div className="relative aspect-square bg-gray-50">
                {!imgFailed && item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className={`w-full h-full object-cover ${!isActive ? 'grayscale opacity-40' : ''}`}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        <span className="text-sm">이미지 없음</span>
                    </div>
                )}

                {/* 1개 한정 배지 */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm border ${
                        isActive 
                            ? 'bg-orange-500/80 text-white border-orange-300/50' 
                            : 'bg-gray-400/80 text-white border-gray-300/50'
                    }`}>
                        1개 한정
                    </span>
                </div>

                {/* 타이머를 사진 하단에 배지로 배치 */}
                <div className="absolute bottom-3 left-3 right-3">
                    <CountdownTimer endDate={item.endDate} large={false} isActive={isActive} />
                </div>

                {/* 오버레이 */}
                {hasWinner && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center text-white">
                            {item.winnerName === 'NoWin' ? (
                                <>
                                    <div className="text-lg font-bold mb-1">당첨자가 없습니다</div>
                                    <div className="text-sm opacity-90">응모자가 없어 당첨자가 선정되지 않았습니다</div>
                                </>
                            ) : item.winnerName === 'working' ? (
                                <>
                                    <div className="text-lg font-bold mb-1">당첨자 선정 중</div>
                                    <div className="text-sm opacity-90">당첨자 선정 작업이 진행 중입니다</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-lg font-bold mb-1">당첨자 발표</div>
                                    <div className="text-sm opacity-90">{item.winnerName}</div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {!hasWinner && isExpired && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="text-lg font-bold mb-1">응모 마감</div>
                            <div className="text-sm opacity-90">응모 기간이 종료되었습니다</div>
                        </div>
                    </div>
                )}
            </div>

            {/* 컨텐츠 영역 */}
            <div className="p-6">
                {/* 상품명 */}
                <h3 className={`text-xl font-bold mb-2 ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                    {item.productName}
                </h3>

                {/* 브랜드 */}
                <p className={`text-sm mb-4 ${
                    isActive ? 'text-gray-500' : 'text-gray-400'
                }`}>
                    {item.brandName}
                </p>

                {/* 에코스톡 정보 */}
                <div className={`text-sm mb-3 ${
                    isActive ? 'text-gray-600' : 'text-gray-500'
                }`}>
                    <span className="font-medium">{item.ecoStockName}</span>
                    <span className="mx-2">·</span>
                    <span>{item.ecoStockAmount}개 필요</span>
                    {loginStatus && isActive && (
                        <>
                            <span className="mx-2">·</span>
                            <span className={hasEnoughStock ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                                {currentQuantity}개 보유
                            </span>
                        </>
                    )}
                </div>

                {/* 가격, 응모 인원 */}
                <div className="flex items-end justify-between mb-6">
                    <div>
                        <div className={`text-sm line-through mb-1 ${
                            isActive ? 'text-gray-400' : 'text-gray-300'
                        }`}>
                            {item.price.toLocaleString("ko-KR")}원
                        </div>
                        <div className={`text-2xl font-bold ${
                            isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                            무료
                        </div>
                    </div>
                    
                    {/* 응모인원 */}
                    {typeof item.participateCount === "number" && (
                        <div className="text-right">
                            <div className={`text-xs mb-1 ${
                                isActive ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                                현재 응모
                            </div>
                            <div className={`text-lg font-bold ${
                                isActive ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                                {item.participateCount.toLocaleString()}명
                            </div>
                        </div>
                    )}
                </div>

                {/* 버튼 */}
                <button
                    onClick={onButtonClick}
                    className={`w-full py-4 rounded-lg font-bold transition-all duration-200 ${
                        isActive
                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isActive}
                >
                    {hasWinner ? '종료된 래플' : isExpired ? '응모 마감' : '응모하러 가기'}
                </button>
            </div>
        </div>
    );
};

export default memo(RaffleCard);