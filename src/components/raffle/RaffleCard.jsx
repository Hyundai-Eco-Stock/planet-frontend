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

    return (
        <div className={`bg-white transition-all duration-200 ${hasWinner ? 'opacity-70' : ''
            }`}>
            {/* 이미지 - 화면 가득 */}
            <div className="relative w-full h-80 bg-gray-50">
                {!imgFailed && item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className={`w-full h-full object-cover ${hasWinner ? 'grayscale' : ''}`}
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
                <div className={`absolute top-3 right-3 text-white px-2 py-1 rounded text-xs font-medium ${hasWinner ? 'bg-gray-500' : 'bg-gray-800'
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

            {/* 본문 */}
            <div className="px-6 py-4">
                {/* 타이머 - 좌측 배치 */}
                {!hasWinner && (
                    <div className="mb-4">
                        <div className="text-emerald-600 font-bold text-left">
                            <CountdownTimer endDate={endDateObj} large={false} />
                        </div>
                    </div>
                )}

                {/* 상품명과 응모 가능 여부 뱃지 */}
                <div className="flex items-start justify-between mb-1">
                    <h3 className={`text-lg font-bold leading-tight flex-1 ${
                        hasWinner ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                        {item.productName}
                    </h3>
                    
                    {!hasWinner && loginStatus && (
                        <div className="ml-2 flex-shrink-0">
                            {hasEnoughStock ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    응모 가능 ({currentQuantity}개 보유)
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                    부족 ({currentQuantity}/{item.ecoStockAmount}개)
                                </span>
                            )}
                        </div>
                    )}
                    
                    {!hasWinner && !loginStatus && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 ml-2 flex-shrink-0">
                            로그인 필요
                        </span>
                    )}
                </div>

                {/* 브랜드명 */}
                <p className="text-sm text-gray-500 mb-4">{item.brandName}</p>

                {/* 가격 정보 */}
                {!hasWinner && (
                    <div className="mb-4">
                        <div className="text-sm text-gray-400 line-through mb-1">
                            {item.price.toLocaleString("ko-KR")}원
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900">0원</span>
                                <span className="text-lg font-bold text-red-500">무료</span>
                            </div>
                            {/* 참여자 수 */}
                            {!hasWinner && (
                                <div className="text-sm text-gray-500 mb-4 text-right">
                                    현재 <span className="text-emerald-600 font-semibold">{item.participateCount}명</span> 응모
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 에코스톡 정보 - 한 줄로 */}
                {!hasWinner && (
                    <div className="mb-4">
                        <div className="flex items-center gap-1">
                            <span className="inline-flex items-center bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">
                                {item.ecoStockName}
                            </span>
                            <span className="text-sm text-gray-600">
                                에코스톡 {item.ecoStockAmount}개 필요
                            </span>
                        </div>
                    </div>
                )}

                {/* 응모 버튼 */}
                <button
                    onClick={onButtonClick}
                    className={`w-full py-3 rounded-md font-bold text-base transition-all duration-200 ${hasWinner
                        ? 'bg-gray-500 text-white cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    disabled={hasWinner}
                >
                    {hasWinner ? '종료' : '응모하러 가기'}
                </button>
            </div>
        </div>
    );
};

export default memo(RaffleCard);