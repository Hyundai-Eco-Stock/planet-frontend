import HeaderWithLogoAndClose from "@/components/_layout/HeaderWithLogoAndClose";
import { useState } from "react";
import { Outlet } from "react-router-dom";

const LayoutLogoAndClose = () => {
    const [title, setTitle] = useState("");
    const [onClose, setOnClose] = useState(null);
    return (
        <div className="m-auto max-w-xl min-h-screen flex flex-col">
            <HeaderWithLogoAndClose title={title} onClose={onClose} />
            <main className="px-4 overflow-y-auto scrollbar-hide flex-1">
                <Outlet context={{ setTitle, setOnClose }} />
            </main>
        </div>
    );
};

export default LayoutLogoAndClose;