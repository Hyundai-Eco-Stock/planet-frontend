import { Outlet } from "react-router-dom";

const LayoutNone = () => {
    return (
        <div className="m-auto max-w-xl min-h-screen flex flex-col">
            <main className="px-4 overflow-y-auto scrollbar-hide flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default LayoutNone;