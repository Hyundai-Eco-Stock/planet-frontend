import Swal from "sweetalert2";

import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuthStore from "@/store/authStore";
import AdminDashboardHeader from "@/components/_layout/AdminDashboardHeader";

const AdminLayout = () => {
    const { loginStatus, role } = useAuthStore();
    const location = useLocation();

    if (!loginStatus || role !== 'ADMIN') {
        Swal.fire({
            icon: "warning",
            title: "관리자 권한이 필요합니다",
            text: "관리자 로그인 후 이용해주세요.",
            showConfirmButton: false,
            timer: 1000,
            customClass: {
                popup: "pb-6",
                htmlContainer: "mb-4",
            }
        })
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <AdminDashboardHeader />
            <main className="px-4 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;