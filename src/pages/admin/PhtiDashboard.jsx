import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { Users, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { fetchIssueAndOrderPatternsByPhti, fetchMemberPercentageByPhti } from "@/api/admin/admin.api";

// 색상 팔레트
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#A855F7", "#14B8A6"];

const PhtiDashboard = () => {
    // PHTI 사용자 분포
    const [phtiDistribution, setPhtiDistribution] = useState([
        // { type: "EGDS", users: 120 },
        // { type: "EGDI", users: 95 },
        // { type: "EGAS", users: 80 },
        // { type: "EGAI", users: 60 },
        // { type: "EPDS", users: 70 },
        // { type: "EPDI", users: 90 },
        // { type: "CPAS", users: 50 },
        // { type: "CPDI", users: 40 },
    ]);

    // 주문/교환 패턴
    const [phtiPattern, setPhtiPattern] = useState([
        // { type: "EGDS", orders: 320, exchanges: 150 },
        // { type: "EGDI", orders: 280, exchanges: 180 },
        // { type: "EGAS", orders: 200, exchanges: 120 },
        // { type: "EGAI", orders: 150, exchanges: 90 },
        // { type: "EPDS", orders: 220, exchanges: 140 },
        // { type: "EPDI", orders: 260, exchanges: 160 },
        // { type: "CPAS", orders: 130, exchanges: 70 },
        // { type: "CPDI", orders: 110, exchanges: 65 },
    ]);

    const [summary, setSummary] = useState({
        totalUsers: 0,
        topPhti: "",
        avgOrders: 0,
    });

    // 요약 통계
    useEffect(() => {
        fetchMemberPercentageByPhti().then((res) => {
            setPhtiDistribution(res.items);
            setSummary((prev) => ({
                ...prev,
                totalUsers: res.totalUsers,
                topPhti: res.topPhti,
            }));
        });

        fetchIssueAndOrderPatternsByPhti().then((res) => {
            setPhtiPattern(res.items);
            setSummary((prev) => ({
                ...prev,
                avgOrders: res.avgOrders,
            }));
        });
    }, []);


    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">PHTI 통계</h1>
                    <p className="text-gray-600">PHTI 유형별 사용자 분포와 행동 패턴을 분석합니다</p>
                </div>

                {/* 요약 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <SummaryCard title="총 사용자" value={`${summary.totalUsers}명`} icon={<Users className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" />
                    <SummaryCard title="최다 사용자 PHTI" value={summary.topPhti} icon={<PieChartIcon className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" />
                    <SummaryCard title="평균 주문 건수" value={`${summary.avgOrders}건`} icon={<BarChart3 className="w-6 h-6 text-green-600" />} bg="bg-green-100" />
                </div>

                {/* 그래프 섹션 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* PHTI 사용자 분포 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">PHTI 유형별 사용자 분포</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={phtiDistribution}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="users"
                                        nameKey="type"
                                        label
                                    >
                                        {phtiDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 주문/교환 패턴 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">PHTI 유형별 주문/교환 패턴</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={phtiPattern} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="orders" fill="#3B82F6" name="주문 건수" />
                                    <Bar dataKey="exchanges" fill="#10B981" name="교환 횟수" />
                                </BarChart>
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

export default PhtiDashboard;