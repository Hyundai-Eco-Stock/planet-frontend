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
        <div className="m-auto max-w-xl h-screen flex flex-col overflow-hidden">
            <HeaderWithLogo title={getTitle()} />
            <main className="px-4 flex-1 overflow-y-auto scrollbar-hide">
                <Outlet />
            </main>
            <footer className="flex-shrink-0 bg-white border-t border-gray-200" style={{ height: '85px' }}>
                <Footer />
            </footer>
        </div>
    );
};

export default LayoutLogoAndFooter;