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
        { title: '내 정보', path: '/my-page/profile' },
        { title: '보유 에코스톡', path: '/my-page/my-eco-stock' },
        { title: '구매 내역', path: '/my-page/my-buy-history' },
        { title: '예약한 에코딜 상품', path: '/my-page/eco-deal-reservation' },
        { title: '래플 응모 내역', path: '/my-page/raffle-history' },
        { title: '내 차 관리하기', path: '/my-page/my-car' },
        { title: '에코 스톡 인증 페이지로 이동', path: '/eco-stock/certificate' },
        { title: '설정', path: '/my-page/settings' }
    ]

    return (
        <div className="px-3">
            <div className="w-full flex justify-between items-center pb-[1rem] border-b border-gray-200">
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
                    navigations.map((nav) => {
                        return (
                            <Link key={nav.path} to={nav.path}>
                                <div className="h-[4rem] flex justify-between items-center text-start font-semibold">
                                    <span>{nav.title}</span>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </div>
                            </Link>
                        )
                    })
                }
            </div>
        </div>
    );
}

export default MyPageMain;