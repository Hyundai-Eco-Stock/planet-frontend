import HeaderWithShoppingAndBack from "@/components/_layout/HeaderWithShoppingAndBack";
import Footer from "@/components/_layout/Footer";
import { Outlet } from "react-router-dom";

const LayoutShoppingWithBack = () => {
    return (
        <div className="m-auto max-w-xl min-h-screen flex flex-col">
            <HeaderWithShoppingAndBack />
            <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default LayoutShoppingWithBack;