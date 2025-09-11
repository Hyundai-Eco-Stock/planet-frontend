import { fetchMemberPhtiResult } from "@/api/member/member.api";
import { fetchAllPhtiList } from "@/api/phti/phti.api";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

const PhtiMain = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("🌱 PHTI 검사");
    }, [setTitle]);

    const [result, setResult] = useState(null);
    const [phtiList, setPhtiList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchMemberPhtiResult();
                setResult(data);

                const list = await fetchAllPhtiList();
                if (data) {
                    const sorted = [...list].sort((a, b) => {
                        if (a.phtiName === data.primaryPhti) return -1;
                        if (b.phtiName === data.primaryPhti) return 1;
                        if (a.phtiName === data.secondaryPhti) return -1;
                        if (b.phtiName === data.secondaryPhti) return 1;
                        if (a.phtiName === data.tertiaryPhti) return -1;
                        if (b.phtiName === data.tertiaryPhti) return 1;
                        return 0;
                    });
                    setPhtiList(sorted);
                } else {
                    setPhtiList(list);
                }
            } catch (err) {
                console.error("PHTI 데이터 조회 실패", err);
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <main className="px-4 py-8 pb-24">
                {/* 최근 결과 */}
                {result ? (
                    <div className="space-y-8">
                        {/* 메인 결과 카드 */}
                        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border border-emerald-200 rounded-3xl p-8 shadow-lg">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <span className="text-3xl">🌱</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">당신의 PHTI 결과</h2>
                                <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm border border-emerald-200">
                                    <span className="text-emerald-600 font-semibold text-sm">개인 맞춤 분석 완료</span>
                                </div>
                            </div>

                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                                    {result.primaryPhti}
                                </h3>
                                <p className="text-gray-700 text-center leading-relaxed mb-6">
                                    {result.primaryPhtiCustomDescription}
                                </p>

                                {/* 성향 분석 차트 */}
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">🌿 에코 성향</span>
                                            <span className="text-sm font-bold text-emerald-600">{result.ecoChoiceRatio}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${result.ecoChoiceRatio}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">💎 가치 소비</span>
                                            <span className="text-sm font-bold text-blue-600">{result.valueChoiceRatio}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${result.valueChoiceRatio}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">⚡ 도전 성향</span>
                                            <span className="text-sm font-bold text-amber-600">{result.raffleChoiceRatio}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-3 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${result.raffleChoiceRatio}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">🎯 포인트 사용</span>
                                            <span className="text-sm font-bold text-purple-600">{result.pointChoiceRatio}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${result.pointChoiceRatio}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-emerald-100">
                                    <div className="flex items-center justify-center gap-6 text-center">
                                        <div>
                                            <div className="text-lg">🥈</div>
                                            <div className="text-xs text-gray-500 mb-1">2순위</div>
                                            <div className="font-semibold text-gray-900 text-sm">{result.secondaryPhti}</div>
                                        </div>
                                        <div className="w-px h-12 bg-emerald-200"></div>
                                        <div>
                                            <div className="text-lg">🥉</div>
                                            <div className="text-xs text-gray-500 mb-1">3순위</div>
                                            <div className="font-semibold text-gray-900 text-sm">{result.tertiaryPhti}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 전체 PHTI 유형 */}
                        <div>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">📚 전체 PHTI 유형</h2>
                                <p className="text-gray-600 text-sm">다양한 소비 성향을 확인해보세요</p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {phtiList.map((item, index) => {
                                    const isPrimary = item.phtiName === result.primaryPhti;
                                    const isSecondary = item.phtiName === result.secondaryPhti;
                                    const isTertiary = item.phtiName === result.tertiaryPhti;

                                    let cardStyle = "bg-white border border-gray-200 hover:border-gray-300";
                                    let badgeContent = null;

                                    if (isPrimary) {
                                        cardStyle = "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-300 shadow-lg";
                                        badgeContent = (
                                            <div className="inline-flex items-center gap-1 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                <span>✨</span>
                                                <span>당신의 주 성향</span>
                                            </div>
                                        );
                                    } else if (isSecondary) {
                                        cardStyle = "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 shadow-md";
                                        badgeContent = (
                                            <div className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                <span>🥈</span>
                                                <span>2순위 성향</span>
                                            </div>
                                        );
                                    } else if (isTertiary) {
                                        cardStyle = "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 shadow-md";
                                        badgeContent = (
                                            <div className="inline-flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                <span>🥉</span>
                                                <span>3순위 성향</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={item.phtiId}
                                            className={`${cardStyle} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg group`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                                                        {item.phtiAlias}
                                                    </h3>
                                                    <p className="text-sm font-medium text-gray-600">{item.phtiName}</p>
                                                </div>
                                                {badgeContent && (
                                                    <div className="ml-3 flex-shrink-0">
                                                        {badgeContent}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 미검사 상태 */
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border border-purple-200 rounded-3xl p-8 max-w-md mx-auto shadow-lg">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <span className="text-4xl">🧠</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">PHTI 검사를 시작해보세요!</h2>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                간단한 질문들을 통해 당신만의<br />
                                개인화된 소비 성향을 분석해드립니다
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <span>⏱️ 약 3-5분 소요</span>
                                <span>•</span>
                                <span>📊 즉시 결과 확인</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border-t border-gray-200 z-50" style={{ height: '85px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="px-4 pt-3 pb-6 h-full flex items-start">
                    <button
                        onClick={() => navigate("/phti/survey")}
                        className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 active:scale-[0.98] shadow-lg"
                    >
                        {result ? '🔄 다시 검사하기' : '🌱 PHTI 검사 시작하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhtiMain;