import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { ProfileButton } from "@/components/auth/ProfileButtons";
import { logout } from "@/api/auth/auth.api";
import { fetchMemberPhtiResult } from "@/api/member/member.api";

const MyPageMain = () => {
    const navigate = useNavigate();
    const name = useAuthStore((s) => s.name);
    const loginStatus = useAuthStore((s) => s.loginStatus);
    const [phtiResult, setPhtiResult] = useState(null);
    const [isProfileFront, setIsProfileFront] = useState(true);

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
        navigate("/my-page/main", { replace: true });
    };

    const goToLogin = () => {
        navigate("/login");
    };

    const handleProfileSwitch = () => {
        setIsProfileFront(!isProfileFront);
    };

    // PHTI별 컬러 매핑 - 4가지 타입으로 수정
    const getPhtiColors = (primaryPhti) => {
        const phtiPrefix = primaryPhti.substring(0, 2).toUpperCase();
        const colorMap = {
            'EG': { primary: 'green-500', secondary: 'green-300', gradient: 'from-green-200 to-green-100' },
            'EP': { primary: 'purple-500', secondary: 'purple-300', gradient: 'from-purple-200 to-purple-100' },
            'CG': { primary: 'emerald-500', secondary: 'emerald-300', gradient: 'from-emerald-200 to-emerald-100' },
            'CP': { primary: 'violet-500', secondary: 'violet-300', gradient: 'from-violet-200 to-violet-100' },
        };
        return colorMap[phtiPrefix] || { primary: 'gray-500', secondary: 'gray-300', gradient: 'from-gray-200 to-gray-100' };
    };

    const quickActions = [
        {
            title: "포인트 관리",
            subtitle: "잔액 확인",
            icon: "💰",
            path: "/my-page/my-assets",
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
                { title: '내 정보 수정', path: '/my-page/profile' },
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

    // PHTI 캐릭터 이미지 경로 생성
    const getPhtiCharacterImage = (primaryPhti) => {
        if (!primaryPhti) return null;
        return `/src/assets/phti/${primaryPhti.toLowerCase()}.png`;
    };

    const phtiColors = phtiResult?.primaryPhti ? getPhtiColors(phtiResult.primaryPhti) : null;

    return (
        <div className="min-h-screen bg-white relative">
            {/* 프로필 헤더 */}
            <div className="bg-white px-4 py-8">
                {loginStatus ? (
                    <div className="flex flex-col items-center text-center">
                        <div className={`relative ${phtiResult?.primaryPhti ? 'mb-6' : 'mb-2'}`}>
                            {phtiResult?.primaryPhti ? (
                                <div
                                    className="w-32 h-32 relative cursor-pointer"
                                    onClick={handleProfileSwitch}
                                >
                                    {/* 배경 그라데이션 효과 */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${phtiColors.gradient} rounded-full blur-xl scale-110 opacity-30`}></div>

                                    {/* 프로필 */}
                                    <div className={`absolute inset-0 transition-all duration-500 ${isProfileFront
                                        ? 'z-20 scale-100 opacity-100'
                                        : 'z-10 scale-95 opacity-40 rotate-3'
                                        }`}>
                                        {/* 프로필 그림자 효과 */}
                                        {isProfileFront && (
                                            <div className={`absolute inset-0 bg-${phtiColors.primary} rounded-full blur-sm scale-105 opacity-20`}></div>
                                        )}
                                        <ProfileButton size="extra-large" />
                                    </div>

                                    {/* PHTI 캐릭터 */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${phtiColors.gradient} rounded-full shadow-lg border-2 border-${phtiColors.secondary} flex items-center justify-center transition-all duration-500 ${!isProfileFront
                                        ? 'z-20 scale-100 opacity-100'
                                        : 'z-10 scale-95 opacity-40 -rotate-3'
                                        }`}>
                                        {/* 캐릭터 뒤 그라데이션 배경 */}
                                        <div className={`absolute inset-0 bg-gradient-to-br from-white/80 to-${phtiColors.secondary}/20 rounded-full`}></div>

                                        {/* 캐릭터 그림자 효과 */}
                                        {!isProfileFront && (
                                            <div className="absolute inset-0 bg-gray-400 rounded-full blur-sm scale-105 opacity-20"></div>
                                        )}

                                        <img
                                            src={getPhtiCharacterImage(phtiResult.primaryPhti)}
                                            alt={`PHTI ${phtiResult.primaryPhti}`}
                                            className="w-20 h-20 object-contain relative z-10 drop-shadow-sm"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    {/* 스위치 힌트 */}
                                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                                        탭하여 전환
                                    </div>
                                </div>
                            ) : (
                                // PHTI가 없을 때: 프로필만 표시
                                <div className="w-32 h-32 relative mb-6">
                                    {/* 기본 배경 효과 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 rounded-full blur-xl scale-110 opacity-30"></div>
                                    <ProfileButton size="extra-large" />
                                </div>
                            )}
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
                <div className="bg-white px-4 py-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">빠른 메뉴</h2>
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
            <div className="bg-white px-4 py-6 pb-12 relative">
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
                    <div className="flex justify-end px-4">
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