import HeaderWithShopping from "@/components/_layout/HeaderWithShopping";
import Footer from "@/components/_layout/Footer";
import { Outlet } from "react-router-dom";

const LayoutShopping = () => {
    return (
        <div className="m-auto max-w-xl min-h-screen flex flex-col">
            <HeaderWithShopping />
            <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
            <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl bg-white border-t border-gray-200" style={{height: '85px'}}>
                <Footer />
            </footer>
        </div>
    );
};

export default LayoutShopping;
