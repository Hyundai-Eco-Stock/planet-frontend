import HeaderWithLogo from "./HeaderWithLogo";
import Footer from "@/components/_layout/Footer";
import { Outlet, useLocation } from "react-router-dom";

const LayoutLogoAndFooter = () => {
    const location = useLocation();

    // 경로별 제목 설정
    const getTitle = () => {
        switch (true) {
            case location.pathname === '/raffle':
                return '래플';
            case location.pathname.startsWith('/raffle/detail/'):
                return '래플';
            case location.pathname === '/eco-stock/main':
                return '에코스톡';
            case location.pathname === '/my-page/main':
                return '마이페이지';
            case location.pathname === '/eco-stock/certificate':
                return '오프라인 활동 인증';
            default:
                return '';
        }
    };

    return (
        <div className="m-auto max-w-xl min-h-screen flex flex-col">
            <HeaderWithLogo title={getTitle()} />
            <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
            <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl bg-white border-t border-gray-200" style={{ height: '65px' }}>
                <Footer />
            </footer>
        </div>
    );
};

export default LayoutLogoAndFooter;