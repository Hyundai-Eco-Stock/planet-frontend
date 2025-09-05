import HeaderWithLogoAndClose from "@/components/_layout/HeaderWithLogoAndClose";
import { Outlet } from "react-router-dom";

const LayoutLogoAndClose = ({ title }) => {
    return (
        <div className="m-auto max-w-xl min-h-screen flex flex-col">
            <HeaderWithLogoAndClose title={title} />
            <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default LayoutLogoAndClose;