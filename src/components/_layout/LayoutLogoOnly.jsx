import HeaderWithLogo from "@/components/_layout/HeaderWithLogo";
import { Outlet } from "react-router-dom";

const LayoutLogoOnly = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <HeaderWithLogo />
            <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default LayoutLogoOnly;