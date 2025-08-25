import { Link, useNavigate } from "react-router-dom";

import useAuthStore from "@/store/authStore";

import ProfileButton from "@/components/auth/ProfileButtons";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { NotificationController } from '@/components/fcm/NotificationController';

import { logout } from "@/api/auth/auth.api";
import { searchRecommendProducts } from "@/api/product/product.api";
import { searchTodayAllEcoDealProducts } from "@/api/product/ecoProduct.api";


const MyPageMain = () => {
    const navigate = useNavigate();

    const name = useAuthStore((s) => s.name);
    const email = useAuthStore((s) => s.email);

    const loginStatus = useAuthStore((s) => s.loginStatus);

    const handleLogout = async () => {
        await logout();
        useAuthStore.getState().clearAuth();
        navigate("/my-page/main", { replace: true });
    };

    const goToLogin = () => {
        navigate("/login");
    };

    const handleEcoDealProducts = () => {
        const res = searchTodayAllEcoDealProducts();
        console.log(res);
    }

    const handleProductRecommend = () => {
        const products = searchRecommendProducts(
            "스트래피 실크 탑", 1, 32, 5
        );
        console.log(products);
    }

    return (
        <div>
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                {loginStatus ? (
                    <>
                        <ProfileButton />
                        <span className="font-semibold">{name} 님</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:underline"
                        >
                            로그아웃
                        </button>
                        <div className="flex flex-col gap-1">
                            <NotificationController />
                            <CustomCommonButton onClick={handleEcoDealProducts} children="에코딜 상품 가져오기" />
                            <CustomCommonButton onClick={() => { navigate("/offline-pay/create") }} children="오프라인 결제 포스기" />
                            <CustomCommonButton onClick={() => { navigate("/car-access-history/create") }} children="차량 입출차 시스템" />
                            <CustomCommonButton onClick={() => { navigate("/eco-stock/certificate") }} children="에코 스톡 인증 페이지로 이동" />
                            <Link to="/my-page/my-car">내 차 관리하기</Link>
                            <CustomCommonButton onClick={handleProductRecommend} children="상품 추천" />
                        </div>
                    </>
                ) : (
                    <button
                        onClick={goToLogin}
                        className="text-sm text-blue-500 hover:underline"
                    >
                        로그인이 필요합니다
                    </button>
                )}
            </div>


        </div>
    );
}

export default MyPageMain;