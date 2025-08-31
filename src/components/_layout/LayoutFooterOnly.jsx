import Footer from "@/components/_layout/Footer";
import { Outlet } from "react-router-dom";

const LayoutFooterOnly = () => {
    return (
        <div className="min-h-full flex flex-col">
            <main className="px-4 min-h-full pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
            <footer className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-white">
                <Footer />
            </footer>
        </div>
    );
};

export default LayoutFooterOnly;