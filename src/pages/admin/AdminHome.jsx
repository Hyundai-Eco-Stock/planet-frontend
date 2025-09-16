import { testNotification, fetch7DayOrderCount, fetchCategorySalesCount, sendFoodDealNotification } from "@/api/admin/admin.api";
import { useNavigate } from "react-router-dom";
import {
    Shield,
    CreditCard,
    CarFront,
    BarChart3,
    Bell,
    ChevronRight,
    ShoppingCart,
    Users,
    PieChart,
    TrendingUp,
    CheckCircle2,
    AlertTriangle
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar
} from "recharts";
import { createCarEnterHistory, createCarExitHistory } from "@/api_department_core_backend/car/carAccessHistory.api";


const AdminHome = () => {
    const navigate = useNavigate();
    const [weeklyOrders, setWeeklyOrders] = useState([]);
    const [categorySales, setCategorySales] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const apiData = await fetch7DayOrderCount();
                const map = new Map(apiData.map(({ orderDate, orderCount }) => [orderDate, orderCount]));
                const today = new Date();
                const last7 = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    d.setDate(d.getDate() - (6 - i));
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    const key = `${y}-${m}-${day}`;
                    const weekday = "일월화수목금토"[d.getDay()];
                    return { d: `${weekday}`, v: map.get(key) ?? 0 };
                });
                setWeeklyOrders(last7);

                const categoryData = await fetchCategorySalesCount();
                setCategorySales(Array.isArray(categoryData) ? categoryData : []);
            } catch (e) {
                console.error("Failed to load 7-day orders", e);
            }
        };
        load();
    }, []);
    

    const cards = [
        {
            key: "offline",
            title: "포스기 관리",
            subtitle: "오프라인 결제",
            Icon: CreditCard,
            gradient: "from-emerald-400 to-teal-500",
            onClick: () => navigate("/offline-pay/create"),
        },
        {
            key: "car",
            title: "입출차 관리",
            subtitle: "차량 시스템",
            Icon: CarFront,
            gradient: "from-sky-500 to-indigo-500",
            onClick: () => navigate("/car-access-history/create"),
        },
        {
            key: "dashboard",
            title: "통계 대시보드",
            subtitle: "리포트",
            Icon: BarChart3,
            gradient: "from-orange-400 to-pink-500",
            onClick: () => navigate("/admin/dashboard/main"),
        },
        {
            key: "notify",
            title: "전체 알림 테스트",
            subtitle: "푸시/토스트",
            Icon: Bell,
            gradient: "from-fuchsia-500 to-rose-500",
            onClick: () => testNotification(),
        },
        {
            key: "notify",
            title: "[시연용] 푸드딜 알림 전송",
            subtitle: "푸시/토스트",
            Icon: Bell,
            gradient: "from-fuchsia-500 to-rose-500",
            onClick: () => sendFoodDealNotification(),
        },
        {
            key: "car",
            title: "[시연용] 차량 입차 알림 전송",
            subtitle: "푸시/토스트",
            Icon: Bell,
            gradient: "from-fuchsia-500 to-rose-500",
            onClick: () => createCarEnterHistory("157더6629"),
        },
        {
            key: "car",
            title: "[시연용] 차량 출차 알림 전송",
            subtitle: "푸시/토스트",
            Icon: Bell,
            gradient: "from-fuchsia-500 to-rose-500",
            onClick: () => createCarExitHistory("157더6629"),
        },
    ];

    return (
        <div className="relative min-h-[calc(100dvh-80px)] pt-16 px-4 md:px-6 pb-12 bg-gradient-to-b from-slate-50 to-white">
            {/* Hero - wide banner */}
            <div className="max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl p-6 md:p-7 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-xl">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
                            <Shield className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">관리자 대시보드</h1>
                            <p className="text-white/80 text-sm md:text-base">운영 현황을 한눈에 보고, 즉시 작업을 실행하세요</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Stats */}
            {/* <div className="max-w-6xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{
                    label: "오늘 주문",
                    value: "128",
                    Icon: ShoppingCart,
                    ring: "ring-emerald-100",
                    chip: "bg-emerald-50 text-emerald-600",
                }, {
                    label: "신규 유저",
                    value: "37",
                    Icon: Users,
                    ring: "ring-sky-100",
                    chip: "bg-sky-50 text-sky-600",
                }, {
                    label: "매출(백만원)",
                    value: "42.7",
                    Icon: TrendingUp,
                    ring: "ring-indigo-100",
                    chip: "bg-indigo-50 text-indigo-600",
                }, {
                    label: "처리 성공률",
                    value: "99.7%",
                    Icon: CheckCircle2,
                    ring: "ring-rose-100",
                    chip: "bg-rose-50 text-rose-600",
                }].map(({ label, value, Icon, ring, chip }, idx) => (
                    <div key={idx} className={`rounded-2xl p-4 bg-white shadow-sm ring-1 ${ring}`}>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs md:text-sm font-medium ${chip} px-2 py-0.5 rounded-full`}>{label}</span>
                            <Icon className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-800">{value}</div>
                    </div>
                ))}
            </div> */}

            {/* Quick Actions */}
            <div className="max-w-6xl mx-auto mt-6">
                <h2 className="text-slate-800 font-extrabold text-lg mb-3">빠른 작업</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {cards.map(({ key, title, subtitle, Icon, gradient, onClick }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={onClick}
                            className={`relative aspect-square w-full rounded-3xl p-4 text-left text-white overflow-hidden shadow-lg 
                                        bg-gradient-to-br ${gradient} 
                                        transition-transform active:translate-y-[1px] hover:brightness-[1.05]`}
                        >
                            <span className="absolute right-3 top-3 text-3xl drop-shadow-sm select-none">
                                <Icon className="h-7 w-7" />
                            </span>
                            <div className="flex h-full flex-col justify-end">
                                <div className="font-extrabold text-2xl leading-tight drop-shadow-sm">{title}</div>
                                <div className="text-white/90 text-base">{subtitle}</div>
                            </div>
                            <div className="absolute inset-0 rounded-3xl ring-1 ring-white/15" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 h-64 md:h-80">
                    <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-slate-800">주간 주문 추이</div>
                        <span className="text-xs text-slate-500">최근 7일</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyOrders} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="d" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip />
                            <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 h-64 md:h-80">
                    <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-slate-800">카테고리별 매출</div>
                        <span className="text-xs text-slate-500">이번 달</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categorySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip />
                            <Bar dataKey="orderCount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;

// Internal small icon for activity list
const AlertCircleIcon = () => (
    <div className="h-7 w-7 rounded-xl bg-slate-100 flex items-center justify-center">
        <Bell className="h-4 w-4 text-slate-500" />
    </div>
);
