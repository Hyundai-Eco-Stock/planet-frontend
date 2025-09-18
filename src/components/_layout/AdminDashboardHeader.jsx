import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AdminProfileButton } from "../auth/ProfileButtons";
import useAuthStore from "@/store/authStore";
import { logout } from "@/api/auth/auth.api";

const AdminHeader = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const name = useAuthStore((s) => s.name);
    const loginStatus = useAuthStore((s) => s.loginStatus);

    const menus = [
        { name: "에코스톡", path: "/admin/dashboard/eco-stock" },
        { name: "주문/상품", path: "/admin/dashboard/order-product" },
        { name: "PHTI", path: "/admin/dashboard/phti" },
        { name: "기부", path: "/admin/dashboard/donation" },
        { name: "래플", path: "/admin/dashboard/raffle" },
    ];

    const handleLogout = async () => {
        await logout();
        useAuthStore.getState().clearAuth();
        navigate("/my-page/main", { replace: true });
    };

    return (
        <header
            className="sticky top-0 z-50 
        bg-white border-b border-gray-200 
        w-full mx-auto px-4 h-16
        flex items-center justify-between"
        >
            {/* 로고 */}
            <div>
                <Link
                    to="/admin/home"
                    className="text-xl text-gray-900
            inline-flex items-center gap-2 font-extrabold tracking-[.2px] text-[24px] leading-none text-inherit no-underline"
                    aria-label="planet 관리자 홈으로 이동"
                >
                    planet 관리자
                </Link>
            </div>

            {/* 데스크탑 메뉴 */}
            <div className="hidden md:flex flex-auto gap-6 justify-center">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        className={({ isActive }) =>
                            `text-sm font-medium ${isActive
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`
                        }
                    >
                        {menu.name}
                    </NavLink>
                ))}
            </div>

            {/* 오른쪽 프로필/로그아웃 */}
            <div className="flex items-center gap-3">
                <AdminProfileButton />
                {loginStatus && (
                    <div className="flex items-center gap-1 text-sm md:text-base">
                        <span className="font-semibold">{name}</span>
                        <span>님</span>
                    </div>
                )}
                {loginStatus && (
                    <button
                        onClick={handleLogout}
                        className="pr-2 text-sm text-red-500 hover:underline"
                    >
                        로그아웃
                    </button>
                )}

                {/* 모바일 햄버거 버튼 */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="메뉴 열기"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {menuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {/* 모바일 메뉴 드롭다운 */}
            {menuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-t border-gray-200 shadow-md md:hidden">
                    <nav className="flex flex-col p-4 gap-3">
                        {menus.map((menu) => (
                            <NavLink
                                key={menu.path}
                                to={menu.path}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `text-sm font-medium ${isActive
                                        ? "text-blue-600 border-l-4 border-blue-600 pl-2"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`
                                }
                            >
                                {menu.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default AdminHeader;