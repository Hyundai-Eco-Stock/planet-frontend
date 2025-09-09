import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "@/store/authStore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { ProfileButton } from "@/components/auth/ProfileButtons";

import { logout } from "@/api/auth/auth.api";


const MyPageMain = () => {
    const navigate = useNavigate();

    const name = useAuthStore((s) => s.name);
    const loginStatus = useAuthStore((s) => s.loginStatus);

    const handleLogout = async () => {
        await logout();
        useAuthStore.getState().clearAuth();
        navigate("/my-page/main", { replace: true });
    };

    const goToLogin = () => {
        navigate("/login");
    };

    const navigations = [
        { title: 'MY / 설정', path: 'TITLE' },
        { title: '내 정보 수정', path: '/my-page/profile' },
        { title: '내 차량번호 관리 및 입/출차 내역 조회', path: '/my-page/my-car' },
        { title: '내 카드 관리 (오프라인 자동 인증용)', path: '/my-page/my-card' },
        // { title: '앱 설정', path: '/my-page/settings' },

        { title: '', path: 'LINE' },

        { title: 'ECO STOCK 인증 / 보유 / 사용', path: 'TITLE' },
        { title: '에코스톡 발급 & 포인트 교환 내역', path: '/my-page/my-assets' },
        // { title: '오프라인 활동 인증', path: '/eco-stock/certificate' },
        { title: '텀블러 사용 인증', path: '/eco-stock/certificate/tumbler' },
        { title: '종이백 미사용 인증', path: '/eco-stock/certificate/paper-bag-no-use' },
        { title: '래플 응모 내역', path: '/my-page/raffle-history' },

        { title: '', path: 'LINE' },

        { title: '구매 / 결제', path: 'TITLE' },
        { title: '상품 구매 내역', path: '/my-page/my-buy-history' },
        { title: '에코딜 예약 내역', path: '/my-page/eco-deal-reservation' },

        // { title: '', path: 'LINE' },

        // { title: '설정', path: 'TITLE' },
    ]

    return (
        <div>
            {/* 프로필 헤더 카드 */}
            <div className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* 네모박스 크기 프로필 버튼 */}
                        <div className="relative">
                            <ProfileButton size="large" />
                            {loginStatus && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                            )}
                        </div>

                        <div>
                            {loginStatus ? (
                                <>
                                    <div className="text-lg font-bold text-gray-900">{name}님</div>
                                    <div className="text-sm text-gray-500">환경을 생각하는 사용자</div>
                                </>
                            ) : (
                                <button
                                    onClick={goToLogin}
                                    className="text-left"
                                >
                                    <div className="text-lg font-bold text-blue-600">로그인이 필요합니다</div>
                                    <div className="text-sm text-gray-500">터치하여 로그인하세요</div>
                                </button>
                            )}
                        </div>
                    </div>

                    {loginStatus && (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            로그아웃
                        </button>
                    )}
                </div>
            </div>

            {/* 퀵 액션 카드들 - 각각 다른 색상 */}
            {loginStatus && (
                <div className="mx-4 mb-6">
                    <div className="grid grid-cols-3 gap-3">
                        <Link to="/my-page/my-assets" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-white">💰</span>
                            </div>
                            <div className="text-xs font-medium text-white">포인트</div>
                            <div className="text-xs text-white/80">관리</div>
                        </Link>

                        <Link to="/eco-stock/certificate" className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-white">🌱</span>
                            </div>
                            <div className="text-xs font-medium text-white">에코스톡</div>
                            <div className="text-xs text-white/80">인증</div>
                        </Link>

                        <Link to="/my-page/my-buy-history" className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-white">🛍️</span>
                            </div>
                            <div className="text-xs font-medium text-white">구매</div>
                            <div className="text-xs text-white/80">내역</div>
                        </Link>
                    </div>
                </div>
            )}

            {/* 메뉴 리스트 */}
            <div className="px-4 space-y-1">
                {navigations.map((nav, idx) => {
                    if (nav.path === 'LINE') {
                        return <div key={idx} className="h-4" />;
                    }

                    if (nav.path === 'TITLE') {
                        return (
                            <div key={idx} className="pt-4 pb-3">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">
                                    {nav.title}
                                </h3>
                            </div>
                        );
                    }

                    // 퀵 액션에 있는 항목들은 제외
                    if (nav.path === '/my-page/my-assets' ||
                        nav.path === '/eco-stock/certificate' ||
                        nav.path === '/my-page/my-buy-history') {
                        return null;
                    }

                    return (
                        <Link to={nav.path} key={idx}>
                            <div className="flex justify-between items-center py-4 px-1 hover:bg-gray-50 rounded-lg transition-colors">
                                <span className="text-gray-900 font-medium">{nav.title}</span>
                                <FontAwesomeIcon
                                    icon={faChevronRight}
                                    className="text-gray-400 text-sm"
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default MyPageMain;