import React, { useEffect, useState } from "react";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, ShoppingBag, DollarSign, BarChart3 } from "lucide-react";
import { fetchProductOrderDataGroupByDay, fetchProductOrderDataGroupByCategory } from "@/api/admin/admin.api";

// 색상 팔레트
const COLORS = [
    "#3B82F6", // 옷
    "#10B981", // 뷰티
    "#F59E0B", // 비누
    "#EF4444", // 향수
    "#8B5CF6", // 헤어
    "#06B6D4", // 식기류
];

const OrderProductDashboard = () => {
    // 일별 주문/매출 데이터
    const [dailyData, setDailyData] = useState([]);

    // 카테고리별 판매 데이터
    const [categoryData, setCategoryData] = useState([]);

    // 요약 통계
    const [summary, setSummary] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        topCategory: ""
    });

    useEffect(() => {
        fetchProductOrderDataGroupByDay().then((res) => {
            setDailyData(res.items);
            setSummary((prev) => ({
                ...prev,
                totalOrders: res.totalOrders,
                totalRevenue: res.totalRevenue,
                avgOrderValue: res.avgOrderValue
            }));
        });

        fetchProductOrderDataGroupByCategory().then((res) => {
            const itemsWithColor = res.items.map((item, idx) => ({
                ...item,
                color: COLORS[idx % COLORS.length], // 고정 팔레트 순환 적용
            }));
            setCategoryData(itemsWithColor);
            setSummary((prev) => ({
                ...prev,
                topCategory: res.topCategory
            }));
        });
    }, []);

    return (
        <div className="">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mt-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">주문/상품 통계</h1>
                    <p className="text-gray-600">일별 주문 현황과 카테고리별 판매 비율을 확인하세요</p>
                </div>

                {/* 요약 카드 */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <SummaryCard title="총 주문 건수" value={`${summary.totalOrders}건`} icon={<ShoppingBag className="w-6 h-6 text-blue-600" />} bg="bg-blue-100" />
                    <SummaryCard title="총 매출액" value={`${summary.totalRevenue.toLocaleString()}원`} icon={<DollarSign className="w-6 h-6 text-green-600" />} bg="bg-green-100" />
                    <SummaryCard title="평균 주문 금액" value={`${summary.avgOrderValue.toLocaleString()}원`} icon={<TrendingUp className="w-6 h-6 text-purple-600" />} bg="bg-purple-100" />
                    <SummaryCard title="TOP 카테고리" value={summary.topCategory} icon={<BarChart3 className="w-6 h-6 text-orange-600" />} bg="bg-orange-100" />
                </div>

                {/* 그래프 섹션 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* 일별 주문/매출 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">일별 주문 건수/매출</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="orders" stroke="#3B82F6" name="주문 건수" />
                                    <Line type="monotone" dataKey="revenue" stroke="#10B981" name="매출액" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 카테고리별 판매 비율 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">카테고리별 판매 비율</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={3}
                                        dataKey="value"
                                        nameKey="category"
                                        label
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {categoryData.map((cat, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center">
                                        <span className="w-4 h-4 rounded mr-2" style={{ backgroundColor: cat.color }}></span>
                                        {cat.category}
                                    </div>
                                    <span>{cat.value.toLocaleString()}원</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 재사용 가능한 요약 카드 컴포넌트
const SummaryCard = ({ title, value, icon, bg }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`${bg} p-3 rounded-full`}>
                {icon}
            </div>
        </div>
    </div>
);

export default OrderProductDashboard;