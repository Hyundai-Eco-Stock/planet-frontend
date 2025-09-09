import { memo, useMemo, useState } from "react";
import CountdownTimer from "./CountdownTimer";
import useAuthStore from "@/store/authStore";

const RaffleCard = ({ item, onButtonClick, personalStockInfoList }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const { loginStatus } = useAuthStore.getState();
    const endDateObj = useMemo(() => new Date(item.endDate), [item.endDate]);
    const userStock = useMemo(
        () => (personalStockInfoList || []).find(s => s.ecoStockName === item.ecoStockName),
        [personalStockInfoList, item.ecoStockName]
    );

    const currentQuantity = userStock?.currentTotalQuantity ?? 0;
    const hasEnoughStock = currentQuantity >= item.ecoStockAmount;
    const hasWinner = !!item.winnerName;
    const isExpired = new Date() > endDateObj;

    return (
        <div className={`bg-white transition-all duration-200 ${hasWinner || isExpired ? 'opacity-70' : ''}`}>
            {/* 이미지 - 화면 가득 */}
            <div className="relative w-full h-80 bg-gray-50">
                {!imgFailed && item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className={`w-full h-full object-cover ${hasWinner || isExpired ? 'grayscale' : ''}`}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgFailed(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        이미지 없음
                    </div>
                )}

                {/* 1개 한정 배지 */}
                <div className={`absolute top-3 right-3 text-white px-2 py-1 rounded text-xs font-medium ${hasWinner || isExpired ? 'bg-gray-500' : 'bg-gray-800'
                    }`}>
                    1개 한정
                </div>

                {/* 당첨자 오버레이 */}
                {hasWinner && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center text-white">
                            {item.winnerName === 'NoWin' ? (
                                <>
                                    <div className="text-lg font-bold mb-1">당첨자가 없습니다</div>
                                    <div className="text-sm">응모자가 없어 당첨자가 선정되지 않았습니다</div>
                                </>
                            ) : item.winnerName === 'working' ? (
                                <>
                                    <div className="text-lg font-bold mb-1">당첨자 선정 중</div>
                                    <div className="text-sm">당첨자 선정 작업이 진행 중입니다</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-lg font-bold mb-1">당첨자 발표</div>
                                    <div className="text-sm">{item.winnerName}</div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 타이머 - 항상 표시 */}
            <div className="px-6 py-3">
                <CountdownTimer endDate={endDateObj} large={false} />
            </div>

            {/* 본문 */}
            <div className="px-6 py-4">
                {/* 상품명과 로그인 필요 배지 */}
                <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-bold leading-tight flex-1 ${hasWinner || isExpired ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                        {item.productName}
                    </h3>

                    {!hasWinner && !isExpired && !loginStatus && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 ml-2 flex-shrink-0">
                            로그인 필요
                        </span>
                    )}
                </div>

                {/* 에코스톡 정보 - 항상 표시 */}
                <div className="mb-3 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <svg className={`w-4 h-4 ${hasWinner || isExpired ? 'text-gray-400' : 'text-emerald-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`font-medium ${hasWinner || isExpired ? 'text-gray-400' : 'text-emerald-600'}`}>
                            {item.ecoStockName}
                        </span>
                    </div>
                    <span className={`text-sm ${hasWinner || isExpired ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.ecoStockAmount}개 필요
                    </span>
                </div>

                {/* 브랜드명 */}
                <p className={`text-sm mb-4 ${hasWinner || isExpired ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.brandName}
                </p>

                {/* 가격 정보 - 항상 표시 */}
                <div className="mb-4">
                    <div className={`text-sm line-through mb-1 ${hasWinner || isExpired ? 'text-gray-400' : 'text-gray-400'}`}>
                        {item.price.toLocaleString("ko-KR")}원
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${hasWinner || isExpired ? 'text-gray-500' : 'text-gray-900'}`}>
                                0원
                            </span>
                            <span className={`text-2xl font-bold ${hasWinner || isExpired ? 'text-gray-400' : 'text-red-500'}`}>
                                100%
                            </span>
                        </div>
                        {/* 참여자 수 */}
                        <div className={`text-sm text-right ${hasWinner || isExpired ? 'text-gray-400' : 'text-gray-500'}`}>
                            현재 <span className={`font-semibold ${hasWinner || isExpired ? 'text-gray-500' : 'text-emerald-600'}`}>
                                {item.participateCount}명
                            </span> 응모
                        </div>
                    </div>
                </div>

                {/* 응모 버튼 */}
                <button
                    onClick={onButtonClick}
                    className={`w-full py-3 rounded-lg font-bold text-base transition-all duration-200 ${hasWinner || isExpired
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900'
                        }`}
                    disabled={hasWinner || isExpired}
                >
                    {hasWinner ? '종료' : isExpired ? '마감' : '응모하러 가기'}
                </button>
            </div>
        </div>
    );
};

export default memo(RaffleCard);