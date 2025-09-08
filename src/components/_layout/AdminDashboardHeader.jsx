import { Link, NavLink, useNavigate } from "react-router-dom";
import ProfileButton from "../auth/ProfileButtons";
import useAuthStore from "@/store/authStore";
import { logout } from "@/api/auth/auth.api";

const AdminHeader = () => {
    const navigate = useNavigate();

    const name = useAuthStore((s) => s.name);
    const loginStatus = useAuthStore((s) => s.loginStatus);

    const menus = [
        { name: "에코스톡", path: "/admin/dashboard/eco-stock" },
        { name: "주문/상품", path: "/admin/dashboard/order-product" },
        { name: "PHTI", path: "/admin/dashboard/phti" },
        { name: "기부", path: "/admin/dashboard/donation" },
    ];

    const handleLogout = async () => {
        await logout();
        useAuthStore.getState().clearAuth();
        navigate("/my-page/main", { replace: true });
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

                <Link
                    to="/admin/dashboard/main"
                    className="text-xl text-gray-900
                    inline-flex items-center gap-2 font-extrabold tracking-[.2px] text-[24px] leading-none text-inherit no-underline"
                    aria-label="planet 홈으로 이동"
                >
                    planet 관리자
                </Link>

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
                {/* 왼쪽 */}
                <div className="flex items-center gap-3">
                    <ProfileButton />
                    <span className="font-semibold">
                        {loginStatus &&
                            <div className="flex items-center gap-1">
                                <span className="text-lg">{name}</span>
                                <span>님</span>
                            </div>
                        }
                    </span>
                    {loginStatus && (
                        <>
                            <button
                                onClick={handleLogout}
                                className="pr-5 text-sm text-red-500 hover:underline"
                            >
                                로그아웃
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;