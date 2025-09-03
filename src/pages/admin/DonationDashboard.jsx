import React, { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { DollarSign, Users, PieChart as PieChartIcon } from "lucide-react";
import { fetchDonationAmountsByDay, fetchDonatorPercentage } from "@/api/admin/admin.api";


const DonationDashboard = () => {
    // 총 기부 금액 추이 (누적)
    const [donationTrend, setDonationTrend] = useState([
        // { date: "2025-08-25", donation: 120000 },
        // { date: "2025-08-26", donation: 180000 },
        // { date: "2025-08-27", donation: 250000 },
        // { date: "2025-08-28", donation: 330000 },
        // { date: "2025-08-29", donation: 400000 },
    ]);

    // 사용자별 기부 참여율
    const [participationData, setParticipationData] = useState([
        // { name: "참여", users: 320, color: "#10B981" },
        // { name: "미참여", users: 180, color: "#EF4444" },
    ]);

    // 요약 통계
    const [summary, setSummary] = useState({
        totalDonation: 0,
        totalUsers: 0,
        participationRate: 0,
    });

    useEffect(() => {
        fetchDonationAmountsByDay().then((res) => {
            setDonationTrend(res.items);
            setSummary((prev) => ({
                ...prev,
                totalDonation: res.totalDonation,
            }));
        });

        fetchDonatorPercentage().then((res) => {
            setParticipationData(res.items);
            setSummary((prev) => ({
                ...prev,
                totalUsers: res.totalUsers,
                participationRate: res.participationRate,
            }));
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">기부 통계</h1>
                    <p className="text-gray-600">총 기부 추이와 사용자 참여율을 확인하세요</p>
                </div>

                {/* 요약 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SummaryCard title="총 기부 금액" value={`${summary.totalDonation.toLocaleString()}원`} icon={<DollarSign className="w-6 h-6 text-green-600" />} bg="bg-green-100" />
                    <SummaryCard title="참여 사용자 수" value={`${summary.totalUsers}명`} icon={<Users className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" />
                    <SummaryCard title="참여율" value={`${summary.participationRate}%`} icon={<PieChartIcon className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" />
                </div>

                {/* 그래프 섹션 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* 기부 금액 추이 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">총 기부 금액 추이</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={donationTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="donation" stroke="#10B981" name="누적 기부액" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 사용자별 참여율 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">사용자별 기부 참여율</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={participationData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="users"
                                        label
                                    >
                                        {participationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

export default DonationDashboard;