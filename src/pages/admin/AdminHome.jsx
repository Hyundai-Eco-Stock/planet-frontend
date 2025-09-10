
import { testNotification } from "@/api/admin/admin.api";
import { useNavigate } from "react-router-dom";


const AdminHome = () => {
    const navigate = useNavigate();

    const cards = [
        {
            key: "offline",
            title: "포스기 관리",
            subtitle: "오프라인 결제",
            icon: "🧾",
            gradient: "from-emerald-400 to-teal-500",
            onClick: () => navigate("/offline-pay/create"),
        },
        {
            key: "car",
            title: "입출차 관리",
            subtitle: "차량 시스템",
            icon: "🚗",
            gradient: "from-sky-500 to-indigo-500",
            onClick: () => navigate("/car-access-history/create"),
        },
        {
            key: "dashboard",
            title: "통계 대시보드",
            subtitle: "리포트",
            icon: "📊",
            gradient: "from-orange-400 to-pink-500",
            onClick: () => navigate("/admin/dashboard/main"),
        },
        {
            key: "notify",
            title: "알림 테스트",
            subtitle: "푸시/토스트",
            icon: "🔔",
            gradient: "from-fuchsia-500 to-rose-500",
            onClick: () => testNotification(),
        },
    ];

    return (
        <div className="pt-24 px-5 pb-8">
            {/* <h1 className="text-2xl font-extrabold text-slate-800 mb-4">관리 도구</h1> */}
            <div className="grid grid-cols-2 gap-4 place-items-center max-w-md mx-auto">
                {cards.map(({ key, title, subtitle, icon, gradient, onClick }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={onClick}
                        className={`relative aspect-square w-11/12 mx-auto rounded-3xl p-4 text-left text-white overflow-hidden shadow-lg 
                                    bg-gradient-to-br ${gradient} 
                                    transition-transform active:translate-y-[1px] hover:brightness-[1.05]`}
                    >
                        <span className="absolute right-3 top-3 text-3xl drop-shadow-sm select-none">{icon}</span>
                        <div className="flex h-full flex-col justify-end">
                            <div className="font-extrabold text-2xl leading-tight drop-shadow-sm">{title}</div>
                            <div className="text-white/90 text-base">{subtitle}</div>
                        </div>
                        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/15" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminHome;
