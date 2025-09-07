import { useEffect, useState } from "react";
import { fetchMemberPointHistory } from "@/api/member/member.api";

const MyPointHistory = () => {
    const [histories, setHistories] = useState([]);
    const [currentPoint, setCurrentPoint] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchMemberPointHistory();
                console.log("data:", data);
                setCurrentPoint(data.currentPoint || 0);
                setHistories(Array.isArray(data.histories) ? data.histories : []);
            } catch (e) {
                console.error("포인트 기록 불러오기 실패", e);
                setError(e?.message || "포인트 기록을 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <>
            <div className="mb-4">
                <span className="text-base md:text-lg font-extrabold text-gray-600">현재 보유 포인트:</span>{" "}
                <span className="font-bold text-emerald-600">
                    {currentPoint.toLocaleString("ko-KR")} P
                </span>
            </div>

            {loading && <div className="text-gray-500">불러오는 중…</div>}
            {error && <div className="text-rose-600">{error}</div>}

            {!loading && !error && (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 w-1/2 text-center">날짜</th>
                                <th className="px-4 py-2 w-1/5 text-center">구분</th>
                                <th className="px-4 py-2 w-1/4 text-center">포인트</th>
                            </tr>
                        </thead>
                        <tbody>
                            {histories.map((h) => (
                                <tr key={h.id} className="border-t">
                                    <td className="px-4 py-4 text-center text-gray-600">
                                        {new Date(h.createdAt).toLocaleString("ko-KR", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        {h.status === "ADD" ? (
                                            <span className="text-emerald-600 font-semibold">적립</span>
                                        ) : (
                                            <span className="text-rose-600 font-semibold">사용</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-2 text-center font-semibold">
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
        </>
    );
};

export default MyPointHistory;