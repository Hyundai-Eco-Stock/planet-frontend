import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users } from 'lucide-react';
import { fetchEcoStockHoldingAmountDataGroupByMember, fetchEcoStockIssuePercentageData } from '@/api/admin/admin.api';


// 고정 색상 팔레트
const COLORS = [
    '#10B981', // 제로컵(Zero Cup)
    '#3B82F6', // 애상(Eco 상품)
    '#8B5CF6', // 이브이(EV)
    '#F59E0B', // 제로백(Bag)
    '#EF4444', // 봉시활동
    '#06B6D4', // 기부온(Give_On)
];

const EcoStockDashboard = () => {
    // 에코스톡 발급 비율 데이터 (mock data)
    const [stockIssueData, setStockIssueData] = useState([]);
    // 사용자별 에코스톡 보유 현황 데이터 (mock data)
    const [userDistributionData, setUserDistributionData] = useState([]);

    // 통계 요약
    const [summary, setSummary] = useState({
        totalIssued: 0,
        totalUsers: 0,
        avgHolding: 0
    });

    useEffect(() => {
        // 발급 비율 데이터 호출
        fetchEcoStockIssuePercentageData()
            .then((res) => {
                // index 순서대로 색상 부여
                const itemsWithColor = res.data.items.map((item, idx) => ({
                    ...item,
                    color: COLORS[idx % COLORS.length],
                }));
                setStockIssueData(itemsWithColor);
                setSummary((prev) => ({ ...prev, totalIssued: res.data.totalIssued }));
            })

        // 보유 현황 데이터 호출
        fetchEcoStockHoldingAmountDataGroupByMember()
            .then((res) => {
                setUserDistributionData(res.data.items); // [{range, userCount, percentage}, ...]
                setSummary({
                    totalIssued: res.data.totalIssued,
                    totalUsers: res.data.totalUsers,
                    avgHolding: res.data.avgHolding,
                });
            })
    }, []);

    // 커스텀 툴팁 컴포넌트
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{data.name}</p>
                    <p className="text-blue-600">발급량: {data.payload.count.toLocaleString()}개</p>
                    <p className="text-green-600">비율: {data.value}%</p>
                </div>
            );
        }
        return null;
    };

    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{label}</p>
                    <p className="text-blue-600">사용자 수: {data.userCount.toLocaleString()}명</p>
                    <p className="text-green-600">비율: {data.percentage}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">에코스톡 관리자 대시보드</h1>
                    <p className="text-gray-600">에코스톡 발급 현황 및 사용자 보유 분포를 확인하세요</p>
                </div>

                {/* 요약 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">총 발급량</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.totalIssued.toLocaleString()}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">총 사용자</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.totalUsers.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">에코스톡 종류</p>
                                <p className="text-2xl font-bold text-gray-900">{stockIssueData.length}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <PieChartIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">평균 보유량</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Math.round(summary.totalIssued / summary.totalUsers).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <BarChart3 className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 차트 섹션 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* 에코스톡 발급 비율 차트 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center mb-6">
                            <PieChartIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">에코스톡 발급 비율</h2>
                        </div>

                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stockIssueData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {stockIssueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 범례 */}
                        <div className="mt-4 grid grid-cols-1 gap-2">
                            {stockIssueData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center">
                                        <div
                                            className="w-4 h-4 rounded mr-3"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-gray-900">{item.count.toLocaleString()}개</span>
                                        <span className="text-xs text-gray-500 ml-1">({item.value}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 사용자별 보유 현황 차트 */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center mb-6">
                            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">사용자별 에코스톡 보유 현황</h2>
                        </div>

                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={userDistributionData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 60,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="range"
                                        stroke="#6b7280"
                                        fontSize={12}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        fontSize={12}
                                        label={{ value: '사용자 수', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <Bar
                                        dataKey="userCount"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* 상세 통계 */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2">분포 특성</h4>
                                <p className="text-xs text-blue-600">
                                    대부분 사용자(
                                    {(
                                        ((userDistributionData[0]?.percentage || 0) +
                                            (userDistributionData[1]?.percentage || 0)).toFixed(1)
                                    )}%
                                    )가 50개 이하 보유
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="text-sm font-semibold text-green-800 mb-2">활성 사용자</h4>
                                <p className="text-xs text-green-600">
                                    10개 이상 보유 사용자: {(
                                        summary.totalUsers - (userDistributionData[0]?.userCount || 0)
                                    ).toLocaleString()}명
                                </p>
                            </div>
                        </div>
                    </div>
                </div>



                {/* 날짜별 필터 및 새로고침 */}
                <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">데이터 설정</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="7">최근 7일</option>
                                <option value="30">최근 30일</option>
                                <option value="90">최근 90일</option>
                                <option value="365">최근 1년</option>
                            </select>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                새로고침
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">마지막 업데이트:</span> 2025년 9월 2일 14:30
                        </div>
                        <div>
                            <span className="font-medium">데이터 기간:</span> 2025년 8월 1일 ~ 9월 2일
                        </div>
                        <div>
                            <span className="font-medium">데이터 소스:</span> 실시간 DB 연동
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EcoStockDashboard;