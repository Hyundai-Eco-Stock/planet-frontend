import HeaderWithShopping from "@/components/_layout/HeaderWithShopping";
import Footer from "@/components/_layout/Footer";
import { Outlet } from "react-router-dom";

const LayoutCartOrder = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <HeaderWithShopping />
            <main className="pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default LayoutCartOrder;