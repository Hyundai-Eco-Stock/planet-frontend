import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import Swal from "sweetalert2";

const SignUpRequiredRoute = () => {
    const { loginStatus, signUpStatus } = useAuthStore();
    const location = useLocation();
    const context = useOutletContext();
    // 로그인은 했지만 회원가입 안한 유저가 회원가입 페이지 이외의 페이지에 접근할 때
    console.log(location.pathname);
    if (loginStatus && !signUpStatus && !['/signup/oauth', '/login/success'].includes(location.pathname) 
        ) {
        Swal.fire({
            icon: "warning",
            title: "회원가입이 필요합니다",
            text: "카카오 로그인 이후 최초 회원가입을 진행해주세요.",
            showConfirmButton: false,
            timer: 1000,
            customClass: {
                popup: "pb-6",
                htmlContainer: "mb-4",
            }
        })
        useAuthStore.getState().clearAuth();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet context={context} />;
};

export default SignUpRequiredRoute;