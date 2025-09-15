import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, Cell
} from "recharts";
import { Gift, Users, TrendingUp } from "lucide-react";
import { fetchRaffleParticipationByRaffle, fetchRaffleParticipationByDay } from "@/api/admin/admin.api";

const COLORS = [
    "#3B82F6", // 파랑
    "#10B981", // 초록
    "#F59E0B", // 주황
    "#EF4444", // 빨강
    "#8B5CF6", // 보라
    "#06B6D4", // 청록
    "#A855F7", // 퍼플
    "#14B8A6", // 민트
];

const RaffleDashboard = () => {
    const [raffleData, setRaffleData] = useState([]);
    const [dailyData, setDailyData] = useState([]);

    const [summary, setSummary] = useState({
        totalRaffles: 0,
        totalParticipants: 0,
        avgParticipants: 0,
    });

    useEffect(() => {
        fetchRaffleParticipationByRaffle().then((res) => {
            setRaffleData(res.items);

            const totalParticipants = res.items.reduce((sum, r) => sum + r.participants, 0);
            const avgParticipants = res.items.length > 0 ? Math.round(totalParticipants / res.items.length) : 0;

            setSummary((prev) => ({
                ...prev,
                totalRaffles: res.items.length,
                totalParticipants,
                avgParticipants,
            }));
        });

        fetchRaffleParticipationByDay().then((res) => {
            setDailyData(res.items);
        });
    }, []);

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mt-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">래플 통계</h1>
                    <p className="text-gray-600">래플별 응모 현황과 일자별 응모 추이를 확인하세요</p>
                </div>

                {/* 요약 카드 */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SummaryCard
                        title="총 래플 수"
                        value={`${summary.totalRaffles}개`}
                        icon={<Gift className="w-6 h-6 text-blue-600" />}
                        bg="bg-blue-100"
                    />
                    <SummaryCard
                        title="총 응모 수"
                        value={`${summary.totalParticipants.toLocaleString()}명`}
                        icon={<Users className="w-6 h-6 text-green-600" />}
                        bg="bg-green-100"
                    />
                    <SummaryCard
                        title="평균 응모 수"
                        value={`${summary.avgParticipants.toLocaleString()}명`}
                        icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                        bg="bg-purple-100"
                    />
                </div>

                {/* 그래프 섹션 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* 래플별 응모 수 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">래플별 응모 수</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={raffleData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="productName" type="category" />
                                    <Tooltip />
                                    <Bar dataKey="participants" name="응모 수">
                                        {raffleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 일자별 응모 추이 */}
                    <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">일자별 응모 추이</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="raffleOpenDate"
                                        ticks={[
                                            // 3일 간격으로 찍은 라벨 + 마지막(today) 추가
                                            ...dailyData
                                            .map((d) => d.raffleOpenDate)
                                            .filter((_, i) => i % 5 === 0),
                                            dailyData[dailyData.length - 1]?.raffleOpenDate
                                        ]}
                                        // interval={5} // 5일마다 라벨 표시
                                        tickFormatter={(date) => date.slice(5)} // "MM-DD"만 표시
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="dailyParticipants" stroke="#10B981" name="응모 수" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 재사용 가능한 요약 카드
const SummaryCard = ({ title, value, icon, bg }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`${bg} p-3 rounded-full`}>{icon}</div>
        </div>
    </div>
);

export default RaffleDashboard;