import HeaderWithBack from "@/components/_layout/HeaderWithBack";
import { Outlet, useOutletContext } from "react-router-dom";
import { useState } from "react";

const LayoutBack = () => {
    const [title, setTitle] = useState("");

    return (
        <div className="m-auto max-w-xl min-h-screen flex flex-col">
            
            <HeaderWithBack title={title} />

            <main className="px-4 overflow-y-auto scrollbar-hide flex-1">
                <Outlet context={{ setTitle }} />
            </main>
        </div>
    );
};

export default LayoutBack;