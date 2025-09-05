import { useEffect, useState } from "react";
import { fetchMemberPointHistory } from "@/api/member/member.api";

const MyPointHistory = () => {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchMemberPointHistory();
                setHistories(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error("포인트 기록 불러오기 실패", e);
                setError(e?.message || "포인트 기록을 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-base md:text-lg font-extrabold mb-3">포인트 기록</h2>

            {loading && <div className="text-gray-500">불러오는 중…</div>}
            {error && <div className="text-rose-600">{error}</div>}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left">날짜</th>
                                <th className="px-4 py-2 text-left">구분</th>
                                <th className="px-4 py-2 text-right">포인트</th>
                            </tr>
                        </thead>
                        <tbody>
                            {histories.map((h) => (
                                <tr key={h.pointExchangeHistoryId} className="border-t">
                                    <td className="px-4 py-2 text-gray-600">
                                        {new Date(h.createdAt).toLocaleString("ko-KR")}
                                    </td>
                                    <td className="px-4 py-2">
                                        {h.status === "ADD" ? (
                                            <span className="text-emerald-600 font-semibold">적립</span>
                                        ) : (
                                            <span className="text-rose-600 font-semibold">사용</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-right font-semibold">
                                        {Number(h.pointPrice).toLocaleString("ko-KR")} P
                                    </td>
                                </tr>
                            ))}
                            {histories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-4 py-6 text-center text-gray-400"
                                    >
                                        포인트 기록이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyPointHistory;