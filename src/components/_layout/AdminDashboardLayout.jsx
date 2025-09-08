import AdminDashboardHeader from "@/components/_layout/AdminDashboardHeader";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
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