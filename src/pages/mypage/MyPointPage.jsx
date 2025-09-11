import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchMemberPointHistory } from "@/api/member/member.api";

const MyPointPage = () => {
    const { setTitle } = useOutletContext();
    const [histories, setHistories] = useState([]);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setTitle("내 포인트");
    }, [setTitle]);

    useEffect(() => {
        const loadPointData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchMemberPointHistory();
                setCurrentPoint(data.currentPoint || 0);
                setHistories(Array.isArray(data.histories) ? data.histories : []);
            } catch (e) {
                console.error("포인트 기록 불러오기 실패", e);
                setError(e?.message || "포인트 기록을 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };

        loadPointData();
    }, []);

    return (
        <div className="min-h-screen bg-white relative">
            {/* 상단 헤더 배너 */}
            <div className="absolute top-0 left-0 right-0 -mx-4">
                <div className="bg-gradient-to-b from-emerald-200/40 via-emerald-100/20 to-transparent px-6 py-8 h-40">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">내 포인트</h1>
                        <p className="text-gray-600">포인트 적립 & 사용 내역을 확인하세요</p>
                    </div>
                </div>
            </div>

            <main className="relative z-10 px-4 pb-20 pt-40">
                {/* 보유 포인트 - 단순 텍스트 */}
                <div className="text-center mb-8">
                    <div className="text-gray-500 text-sm mb-1">보유 포인트</div>
                    <div className="text-4xl font-bold text-emerald-600">
                        {currentPoint.toLocaleString("ko-KR")} P
                    </div>
                </div>

                {/* 포인트 이력 */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4 py-4">
                        <h2 className="text-lg font-bold text-gray-900">전체</h2>
                        <span className="text-sm text-gray-500">{histories.length}건</span>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2"></div>
                                <div className="text-gray-500 text-sm">불러오는 중...</div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                            <div className="text-red-600 text-sm">{error}</div>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {histories.length > 0 ? (
                                <div className="space-y-0">
                                    {histories.map((history) => (
                                        <PointHistoryRow key={history.id} history={history} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📝</span>
                                    </div>
                                    <div className="text-gray-500 mb-2">포인트 이력이 없습니다</div>
                                    <div className="text-gray-400 text-sm">포인트를 적립하거나 사용하면 여기에 표시됩니다</div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

const PointHistoryRow = ({ history }) => {
    const isAdd = history.status === "ADD";
    const amount = Number(history.pointPrice || 0);
    const date = new Date(history.createdAt);

    return (
        <div className="py-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-gray-900">
                            {isAdd ? '포인트 적립' : '포인트 사용'}
                        </div>
                        <div className={`font-bold text-lg ${isAdd ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                            {isAdd ? '+' : ''}{amount.toLocaleString("ko-KR")}P
                        </div>
                    </div>
                    <div className="text-gray-500 text-sm">
                        {/* 예시 설명 - 실제로는 API에서 받아올 데이터 */}
                        {isAdd ? '환경 활동 포인트 적립' : '상품 구매 사용'}
                    </div>
                </div>
            </div>
            <div className="text-gray-400 text-xs mt-2">
                {date.toLocaleDateString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                })}
            </div>
        </div>
    );
};

export default MyPointPage;