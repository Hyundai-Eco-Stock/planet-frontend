import HeaderWithShopping from "@/components/_layout/HeaderWithShopping";
import Footer from "@/components/_layout/Footer";
import { Outlet } from "react-router-dom";

const LayoutShopping = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <HeaderWithShopping />
            <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
            <footer className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-white">
                <Footer />
            </footer>
        </div>
    );
};

export default LayoutShopping;