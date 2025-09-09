import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faArrowLeft, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import CartIcon from '@/assets/navigation_icon/Cart.svg';

const HeaderWithShopping = ({ onBackClick }) => {
    const navigate = useNavigate();
    const [totalCartCount, setTotalCartCount] = useState(0);

    // localStorage에서 장바구니 데이터를 읽어서 카운트 계산
    const calculateCartCount = () => {
        try {
            const cartData = localStorage.getItem('cart-storage');
            if (!cartData) return 0;

            const parsedData = JSON.parse(cartData);
            const state = parsedData.state || parsedData;

            const deliveryCount = state.deliveryCart ? state.deliveryCart.length : 0;
            const pickupCount = state.pickupCart ? state.pickupCart.length : 0;

            return deliveryCount + pickupCount;
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            return 0;
        }
    };

    // 초기 카운트 설정 및 localStorage 변경 감지
    useEffect(() => {
        // 초기값 설정
        setTotalCartCount(calculateCartCount());

        // localStorage 변경 감지
        const handleStorageChange = (e) => {
            if (e.key === 'cart-storage') {
                setTotalCartCount(calculateCartCount());
            }
        };

        // 같은 탭에서의 localStorage 변경 감지를 위한 커스텀 이벤트
        const handleCartUpdate = () => {
            setTotalCartCount(calculateCartCount());
        };

        // 이벤트 리스너 등록
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cartStorageUpdate', handleCartUpdate);

        // 정기적으로 체크
        const interval = setInterval(() => {
            const currentCount = calculateCartCount();
            setTotalCartCount(prev => {
                return prev !== currentCount ? currentCount : prev;
            });
        }, 500);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartStorageUpdate', handleCartUpdate);
            clearInterval(interval);
        };
    }, []);

    const onSearchClick = () => {
        navigate("/~~~~~");
    };

    const onCartClick = () => {
        navigate("/cart/main");
    };

    const handleBack = () => {
        if (typeof onBackClick === 'function') return onBackClick();
        navigate(-1); // 직전 페이지로 이동
    };

    return (
        <header className="px-4 sticky top-0 z-50 bg-white text-[#0b1020]">
            <div className="flex items-center justify-between py-3 h-16">
                {/* 왼쪽: 로고 텍스트 */}
                <button
                    onClick={handleBack}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="뒤로가기"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                {/* 오른쪽: 검색/장바구니 아이콘 */}
                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={onCartClick}
                        aria-label="장바구니 보기"
                        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                        <img
                            src={CartIcon}
                            className="w-5 h-5 transition-all duration-200"
                            style={{
                                filter: 'brightness(0) saturate(100%) invert(7%) sepia(7%) saturate(1065%) hue-rotate(202deg) brightness(99%) contrast(88%)'
                            }}
                        />
                        <span className="sr-only">장바구니</span>

                        {totalCartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
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
