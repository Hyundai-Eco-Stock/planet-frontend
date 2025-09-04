import { NavLink } from "react-router-dom";

const AdminHeader = () => {
    const menus = [
        { name: "에코스톡", path: "/admin/dashboard/eco-stock" },
        { name: "주문/상품", path: "/admin/dashboard/order-product" },
        { name: "PHTI", path: "/admin/dashboard/phti" },
        { name: "기부", path: "/admin/dashboard/donation" },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
                <h1 className="
                    text-xl text-gray-900
                    inline-flex items-center gap-2 font-extrabold tracking-[.2px] text-[24px] leading-none text-inherit no-underline
                ">
                    planet 관리자 대시보드
                    </h1>
                <nav className="flex gap-6">
                    {menus.map((menu) => (
                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            className={({ isActive }) =>
                                `text-sm font-medium ${isActive ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
                                }`
                            }
                        >
                            {menu.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default AdminHeader;