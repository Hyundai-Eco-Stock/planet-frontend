import HeaderWithBack from "@/components/_layout/HeaderWithBack";
import { Outlet, useOutletContext } from "react-router-dom";
import Footer from "./Footer";
import { useState } from "react";

const LayoutBack = () => {
    const [title, setTitle] = useState("");

    return (
        <div className="min-h-screen flex flex-col">
            
            <HeaderWithBack title={title} />

            <main className="px-4 pb-24 overflow-y-auto scrollbar-hide flex-1">
                <Outlet context={{ setTitle }} />
            </main>

            <footer className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-white">
                <Footer />
            </footer>
        </div>
    );
};

export default LayoutBack;