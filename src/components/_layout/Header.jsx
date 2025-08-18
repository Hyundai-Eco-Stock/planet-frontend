import styles from "./Header.module.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faBagShopping } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
    const navigate = useNavigate();

    const onSearchClick = () => {
        // 원하는 경로로 변경하세요
        navigate("/~~~~~");
    };

    const onCartClick = () => {
        // 원하는 경로로 변경하세요
        navigate("/~~~~~~");
    };

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
                        className={styles.iconBtn}
                        onClick={onCartClick}
                        aria-label="장바구니 보기"
                    >
                        <FontAwesomeIcon icon={faBagShopping} />
                        <span className={styles.srOnly}>장바구니</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;