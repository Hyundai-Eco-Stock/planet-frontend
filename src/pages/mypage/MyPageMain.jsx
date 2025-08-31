import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "@/store/authStore";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import ProfileButton from "@/components/auth/ProfileButtons";

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
        { title: '내 정보', path: '/my-page/profile' },
        { title: '내 차량번호 등록 및 입/출차 내역', path: '/my-page/my-car' },
        { title: '앱 설정', path: '/my-page/settings' },
        
        { title: '', path: 'LINE' },
        
        { title: 'ECO STOCK 인증 / 보유 / 사용', path: 'TITLE' },
        { title: '에코스톡 발급/사용 내역', path: '/my-page/my-eco-stock' },
        { title: '오프라인 활동 인증', path: '/eco-stock/certificate' },
        { title: '래플 응모 내역', path: '/my-page/raffle-history' },

        { title: '', path: 'LINE' },

        { title: '구매 / 결제', path: 'TITLE' },
        { title: '상품 구매 내역', path: '/my-page/my-buy-history' },
        { title: '에코딜 예약 내역', path: '/my-page/eco-deal-reservation' },
        
        // { title: '', path: 'LINE' },

        // { title: '설정', path: 'TITLE' },
    ]

    return (
        <div className="pt-3 px-2">
            <div className="w-full flex justify-between items-center pb-[1rem] border-gray-200">
                {/* 왼쪽 */}
                <div className="flex items-center gap-3">
                    <ProfileButton />
                    <span className="font-semibold">
                        {loginStatus ?
                            <div className="flex items-center gap-1">
                                <span className="text-lg">{name}</span>
                                <span>님</span>
                            </div>
                            :
                            <button
                                onClick={goToLogin}
                                className="text-blue-500 hover:underline"
                            >
                                로그인이 필요합니다.
                            </button>}
                    </span>
                </div>
                {/* 오른쪽 */}
                {loginStatus ? (
                    <>
                        <button
                            onClick={handleLogout}
                            className="pr-5 text-sm text-red-500 hover:underline"
                        >
                            로그아웃
                        </button>
                    </>
                ) : null}
            </div>

            <div className="flex flex-col gap-1">
                {
                    navigations.map((nav, idx) => {
                        if (nav.path == 'LINE') {
                            return <hr key={idx} className="border-gray-200" />;
                        }
                        if (nav.path == 'TITLE') {
                            return  <span className="font-bold pt-6 pb-2">{nav.title}</span>
                        }
                        return (
                            <Link to={nav.path} key={idx}>
                                <div className="h-[4rem] flex justify-between items-center text-start font-semibold">
                                    <span>{nav.title}</span>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </div>
                            </Link>
                        );
                    })
                }
            </div>
        </div>
    );
}

export default MyPageMain;