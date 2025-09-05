import { memo, useMemo, useState } from "react";
import CountdownTimer from "./CountdownTimer";
import useAuthStore from "@/store/authStore";

const RaffleCard = ({ item, onButtonClick, personalStockInfoList }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const { loginStatus } = useAuthStore.getState();
    // 바뀔 때만 다시 계산되도록 가볍게 메모
    const endDateObj = useMemo(() => new Date(item.endDate), [item.endDate]);
    const userStock = useMemo(
        () => (personalStockInfoList || []).find(s => s.ecoStockName === item.ecoStockName),
        [personalStockInfoList, item.ecoStockName]
    );

    const currentQuantity = userStock?.currentTotalQuantity ?? 0;
    const hasEnoughStock = currentQuantity >= item.ecoStockAmount;
    const hasWinner = !!item.winnerName; // 당첨자가 있는지 확인

    return (
        <div className="relative bg-white backdrop-blur-sm rounded-3xl shadow-xl cursor-pointer transition-all duration-300 border border-gray-300">
            {/* 이미지 */}
            <div className="relative p-6 pb-0">
                <div className="w-full h-64 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                    {!imgFailed && item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-2xl"
                            loading="lazy"
                            decoding="async"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div className="w-32 h-40 bg-white/20 backdrop-blur-sm rounded-lg relative flex">
                            <div className="w-12 h-12 bg-white/30 rounded-full absolute -top-3 left-1/2 -translate-x-1/2" />
                            <div className="w-6 h-28 bg-white/40 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
                        </div>
                    )}
                </div>
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    1개 한정
                </div>
            </div>

            {/* 본문 */}
            <div className="p-6 space-y-6">
                <div className="text-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 ${hasWinner
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-600 text-white'
                        }`}>
                        {hasWinner ? '당첨자 발표' : '진행중'}
                    </div>
                    <div className="mb-4">
                        <CountdownTimer endDate={endDateObj} large />
                    </div>
                </div>

                {/* 당첨자 정보 표시 */}
                {hasWinner && (
                    <div className="text-center mb-4">
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                            <div className="text-yellow-800 font-bold text-lg mb-2">🎉 당첨자</div>
                            <div className="text-yellow-700 font-semibold">{item.winnerName}</div>
                        </div>
                    </div>
                )}

                {/* 로그인 상태에 따른 에코스톡 정보 표시 */}
                <div className="text-center mb-4">
                    {!loginStatus ? (
                        <div className="inline-block px-4 py-2 rounded-full text-sm font-medium border-2 bg-blue-100 text-blue-700 border-blue-300">
                            <span className="flex items-center gap-2">
                                <span>🔐 로그인 필요</span>
                            </span>
                        </div>
                    ) : (
                        <div
                            className={`inline-block px-4 py-2 rounded-full text-sm font-medium border-2 ${hasEnoughStock
                                ? "bg-green-100 text-green-700 border-green-300"
                                : "bg-red-100 text-red-700 border-red-300"
                                }`}
                        >
                            {hasEnoughStock ? (
                                <span className="flex items-center gap-2">
                                    <span>✅ 응모 가능</span>
                                    <span className="text-xs">({currentQuantity}개 보유)</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span>❌ {item.ecoStockName} 부족</span>
                                    <span className="text-xs">
                                        ({currentQuantity}/{item.ecoStockAmount}개)
                                    </span>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="text-center space-y-3">
                    <div className="inline-block bg-white text-white px-3 py-1 rounded-full text-xs font-medium mb-2">
                        <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-md font-semibold">
                            {item.ecoStockName}
                        </span>
                        <span className="ml-2 text-black">
                            에코스톡 {item.ecoStockAmount}개 필요
                        </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                        [{item.brandName}] {item.productName}
                    </h3>

                    <p className="text-lg text-red-600 font-semibold">
                        <span className="text-black line-through">
                            {item.price.toLocaleString("ko-KR")}원
                        </span>
                        <span className="mx-2">→</span>
                        <span className="text-green-600 font-bold">0원</span>
                    </p>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mt-4">
                        <span>
                            참여자 수:{" "}
                            <span className="text-green-600 font-bold">
                                {item.participateCount}명 참여
                            </span>
                        </span>
                    </div>

                    <button
                        onClick={onButtonClick}
                        className="mt-6 px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg w-full bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    >
                        응모하러 가기
                    </button>
                </div>
            </div>
        </div>
    );
};

// 기본 memo만 사용
export default memo(RaffleCard);
