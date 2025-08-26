import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faBagShopping } from "@fortawesome/free-solid-svg-icons";
import useCartStore from "@/store/cartStore";

const HeaderWithShopping = () => {
    const navigate = useNavigate();

    const onSearchClick = () => {
        navigate("/~~~~~");
    };

    const onCartClick = () => {
        navigate("/cart/main");
    };

    const { getTotalProducts } = useCartStore();
    const totalCartCount = getTotalProducts("delivery") + getTotalProducts("pickup");

    return (
        <header className="px-4 sticky top-0 z-50 bg-white text-[#0b1020]">
            <div className="flex items-center justify-between py-3 h-16">
                {/* 왼쪽: 로고 텍스트 */}
                <Link
                    to="/home"
                    className="inline-flex items-center gap-2 font-extrabold tracking-[.2px] text-[24px] leading-none text-inherit no-underline"
                    aria-label="planet 홈으로 이동"
                >
                    planet
                </Link>

                {/* 오른쪽: 검색/장바구니 아이콘 */}
                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={onSearchClick}
                        aria-label="검색 열기"
                        className="flex items-center justify-center w-9  rounded-lg text-gray-900 hover:bg-gray-200 transition-transform transform hover:-translate-y-[1px]"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg" />
                        <span className="sr-only">검색</span>
                    </button>

                    <button
                        type="button"
                        onClick={onCartClick}
                        aria-label="장바구니 보기"
                        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-900 hover:bg-gray-200 transition-transform transform hover:-translate-y-[1px]"
                    >
                        <FontAwesomeIcon icon={faBagShopping} className="text-lg" />
                        <span className="sr-only">장바구니</span>

                        {/* 장바구니 개수 배지 */}
                        {totalCartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5  flex items-center justify-center font-medium">
                                {totalCartCount > 99 ? "99+" : totalCartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HeaderWithShopping;