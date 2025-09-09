import HeaderWithLogoAndSetting from "@/components/_layout/HeaderWithLogoAndSetting";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const LayoutLogoAndSetting = () => {
    const [title, setTitle] = useState("");
    
    return (
        <div className="m-auto max-w-xl min-h-screen flex flex-col">
            <HeaderWithLogoAndSetting title={title} />
            <main className="px-4 overflow-y-auto scrollbar-hide flex-1">
                <Outlet context={{ setTitle }} />
            </main>
            <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 h-24 w-full max-w-xl bg-white">
                <Footer />
            </footer>
        </div>
    );
};

export default LayoutLogoAndSetting;