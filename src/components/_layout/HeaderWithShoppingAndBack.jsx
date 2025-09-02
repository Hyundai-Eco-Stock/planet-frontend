import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faBagShopping, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";

const HeaderWithShopping = () => {
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

    const onBackClick = () => {
        navigate(-1); // 직전 페이지로 이동
    };

    return (
        <header className="px-4 sticky top-0 z-50 bg-white text-[#0b1020]">
            <div className="flex items-center justify-between py-3 h-16">
                {/* 왼쪽: 로고 텍스트 */}
                <button
                    type="button"
                    onClick={onBackClick}
                    aria-label="뒤로가기"
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-900 hover:bg-gray-200 transition-transform transform hover:-translate-y-[1px]"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
                    <span className="sr-only">뒤로가기</span>
                </button>

                {/* 오른쪽: 검색/장바구니 아이콘 */}
                <div className="flex items-center gap-6">
                    <button
                        type="button"
                        onClick={onSearchClick}
                        aria-label="검색 열기"
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-900 hover:bg-gray-200 transition-transform transform hover:-translate-y-[1px]"
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
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
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