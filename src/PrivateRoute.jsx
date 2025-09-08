import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import Swal from "sweetalert2";

const PrivateRoute = () => {
    const { loginStatus } = useAuthStore();
    const location = useLocation();
    const context = useOutletContext();

    if (!loginStatus) {
        Swal.fire({
            icon: "warning",
            title: "로그인이 필요합니다",
            text: "로그인 후 이용해주세요.",
            showConfirmButton: false,
            timer: 1000,
            customClass: {
                popup: "pb-6",
                htmlContainer: "mb-4",
            }
        })
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet context={context} />;
};

export default PrivateRoute;