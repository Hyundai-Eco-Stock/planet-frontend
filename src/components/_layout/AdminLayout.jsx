import AdminHeader from "@/components/_layout/AdminHeader";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <AdminHeader />
            <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;