import styles from "./Header.module.css";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

import useAuthStore from "@/store/authStore";

import ProfileButton from "@/components/auth/ProfileButtons";
import { logout } from "@/api/auth/auth.api";

const Header = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);

    const clearAuth = useAuthStore((state) => state.clearAuth);
    const name = useAuthStore((s) => s.name);
    const email = useAuthStore((s) => s.email);
    const profile = useAuthStore((s) => s.profile);

    // 라우트가 바뀌면 메뉴 자동 닫기
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // ESC로 닫기
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const handleLogout = async() => {
        // logout().then(() => {
        //     clearAuth();
        //     navigate("/home", { replace: true });
        // })
        await logout();
        useAuthStore.getState().clearAuth();
        navigate("/home", { replace: true });
    }

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                {/* 왼쪽 */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    {/* 브랜드 / 로고 */}
                    <Link to="/home" className={styles.brand}>
                        <span className={styles.brandDot} />
                        <span>MyApp</span>
                    </Link>

                    {/* 데스크톱 네비게이션 */}
                    <nav className={styles.navDesktop} aria-label="Primary">
                        <Link
                            to="/home"
                            className={`${styles.navLink} ${pathname === "/home" ? styles.activeLink : ""}`}
                        >
                            Home
                        </Link>
                    </nav>
                </div>

                {/* 오른쪽 */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ProfileButton />
                    {
                        name && email && profile && <button onClick={handleLogout}>로그아웃</button>
                    }
                </div>

                {/* 햄버거 버튼 (모바일 전용) */}
                <button
                    className={styles.hamburger}
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-drawer"
                    onClick={() => setOpen((v) => !v)}
                >
                    <FontAwesomeIcon icon={open ? faXmark : faBars} />
                </button>
            </div>

            {/* 오버레이 */}
            <div
                className={`${styles.overlay} ${open ? styles.overlayShow : ""}`}
                onClick={() => setOpen(false)}
            />

            {/* 모바일 드로어 */}
            <nav
                id="mobile-drawer"
                className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
                aria-label="Mobile"
            >
                <Link
                    to="/home"
                    className={`${styles.drawerLink} ${pathname === "/home" ? styles.activeLink : ""}`}
                >
                    Home
                </Link>
                {/* <Link
                    to="/login"
                    className={`${styles.drawerLink} ${pathname === "/login" ? styles.activeLink : ""}`}
                >
                    Login
                </Link> */}
            </nav>
        </header>
    );
};

export default Header;