import styles from "./Header.module.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faBagShopping } from "@fortawesome/free-solid-svg-icons";
import useCartStore from '@/store/cartStore'

const Header = () => {
    const navigate = useNavigate();

    const onSearchClick = () => {
        // 원하는 경로로 변경하세요
        navigate("/~~~~~");
    };

    const onCartClick = () => {
        // 원하는 경로로 변경하세요
        navigate("/cart/main");
    };

    const { getTotalProducts } = useCartStore()

    // 전체 장바구니 개수 계산
    const totalCartCount = getTotalProducts('delivery') + getTotalProducts('pickup')

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                {/* 왼쪽: 로고 텍스트 */}
                <Link to="/home" className={styles.brand} aria-label="planet 홈으로 이동">
                    planet
                </Link>

                {/* 오른쪽: 검색/장바구니 아이콘 */}
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={onSearchClick}
                        aria-label="검색 열기"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        <span className={styles.srOnly}>검색</span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.iconBtn} relative`}
                        onClick={onCartClick}
                        aria-label="장바구니 보기"
                    >
                        <FontAwesomeIcon icon={faBagShopping} />
                        <span className={styles.srOnly}>장바구니</span>
                        
                        {/* 장바구니 개수 배지 */}
                        {totalCartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                {totalCartCount > 99 ? '99+' : totalCartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;