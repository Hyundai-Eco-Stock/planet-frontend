import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { ProfileButton } from "@/components/auth/ProfileButtons";
import { logout } from "@/api/auth/auth.api";
import { fetchMemberPhtiResult } from "@/api/member/member.api";
import { useNotifications } from "@/hooks/fcm_notification/useNotifications";

const MyPageMain = () => {
    const navigate = useNavigate();
    const name = useAuthStore((s) => s.name);
    const loginStatus = useAuthStore((s) => s.loginStatus);
    const [phtiResult, setPhtiResult] = useState(null);

    const { revokePushToken } = useNotifications();

    useEffect(() => {
        const fetchPhtiResult = async () => {
            if (!loginStatus) return;
            try {
                const result = await fetchMemberPhtiResult();
                setPhtiResult(result);
            } catch (error) {
                console.error("PHTI 결과 조회 실패:", error);
            }
        };

        fetchPhtiResult();
    }, [loginStatus]);

    const handleLogout = async () => {
        await logout();
        useAuthStore.getState().clearAuth();
        await revokePushToken();
        navigate("/my-page/main", { replace: true });
    };

    const goToLogin = () => {
        navigate("/login");
    };

    const quickActions = [
        {
            title: "포인트 관리",
            subtitle: "잔액 확인",
            icon: "💰",
            path: "/my-page/point",
            color: "emerald"
        },
        {
            title: "에코스톡",
            subtitle: "보유 현황",
            icon: "💎",
            path: "/my-page/eco-stock",
            color: "blue"
        },
        {
            title: "주문 관리",
            subtitle: "구매 내역",
            icon: "📦",
            path: "/my-page/my-buy-history",
            color: "purple"
        }
    ];

    const menuSections = [
        {
            title: "MY / 설정",
            items: [
                { title: '계정 설정', path: '/my-page/profile' },
                { title: '내 차량 번호 관리 및 입·출차 내역 조회', path: '/my-page/my-car' },
                { title: '내 카드 관리 (오프라인 자동 인증용)', path: '/my-page/my-card' },
            ]
        },
        {
            title: "오프라인 환경 인증",
            items: [
                { title: '텀블러 사용 인증', path: '/eco-stock/certificate/tumbler' },
                { title: '종이백 미사용 인증', path: '/eco-stock/certificate/paper-bag-no-use' },
            ]
        },
        {
            title: "구매 / 결제",
            items: [
                { title: '주문 관리', path: '/my-page/my-buy-history' },
                { title: '에코딜 예약 내역', path: '/my-page/eco-deal-reservation' },
            ]
        },
        {
            title: "응모 / 이벤트",
            items: [
                { title: '래플 현황', path: '/my-page/raffle-history' },
            ]
        }
    ];

    return (
        <div className="bg-white">
            {/* 프로필 헤더 */}
            <div className="bg-white py-8">
                {loginStatus ? (
                    <div className="flex flex-col items-center text-center">
                        {/* 단순한 프로필 사진만 표시 */}
                        <div className="w-32 h-32 relative mb-6">
                            {/* 기본 배경 효과 */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-emerald-100 rounded-full blur-xl scale-110 opacity-30"></div>
                            <ProfileButton size="extra-large" />
                        </div>

                        <div className="text-base font-bold text-gray-900 mb-1">
                            환경을 생각하는 {name}님 안녕하세요 👋🏻
                        </div>
                        <div className="text-sm text-gray-500">
                            지구를 위한 작은 실천이 큰 변화를 만듭니다
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <button
                            onClick={goToLogin}
                            className="text-center"
                        >
                            <div className="text-base font-bold text-blue-600 mb-1">
                                로그인이 필요합니다
                            </div>
                            <div className="text-sm text-gray-500">
                                터치하여 로그인하세요
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* 퀵 액션 카드들 */}
            {loginStatus && (
                <div className="bg-white px-2 py-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">빠른 메뉴</h2>
                        <Link
                            to="/my-page/settings"
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className="relative group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-200 to-${action.color}-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                                <div className={`relative bg-white/70 backdrop-blur-sm border border-${action.color}-200/40 rounded-xl p-4 text-${action.color}-700 hover:scale-105 hover:bg-white/80 transition-all duration-200 shadow-sm`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-100/30 to-transparent rounded-xl`}></div>
                                    <div className="relative z-10">
                                        <div className="flex justify-start mb-3 pl-1">
                                            <span className="text-2xl">{action.icon}</span>
                                        </div>
                                        <div className="text-xs font-bold mb-1 text-left">{action.title}</div>
                                        <div className="text-xs opacity-80 text-left">{action.subtitle}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 메뉴 섹션들 */}
            <div className="bg-white px-2 py-6 pb-12 relative">
                {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-4">
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 rounded-t-2xl">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    {section.title}
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {section.items.map((item, itemIndex) => (
                                    <Link
                                        key={itemIndex}
                                        to={item.path}
                                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-gray-900 font-medium text-sm leading-relaxed">
                                            {item.title}
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faChevronRight}
                                            className="text-gray-400 text-xs"
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* 로그아웃 버튼 */}
                {loginStatus && (
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:text-red-600 hover:underline transition-all duration-200"
                        >
                            로그아웃
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyPageMain;