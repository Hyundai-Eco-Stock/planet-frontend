import styles from "./Header.module.css";

import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";


/**
 * 
 * @param {*} title 제목
 * @returns 
 */
const HeaderWithBack = ({
    title = "",
}) => {
    const navigate = useNavigate();

    const onBackClick = () => {
        navigate(-1); // 직전 페이지로 이동
    };

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                {/* 왼쪽: 뒤로가기 버튼 */}
                <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={onBackClick}
                    aria-label="뒤로가기"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span className={styles.srOnly}>뒤로가기</span>
                </button>

                <h1 className={styles.title}>{title}</h1>

                <div className={styles.actions}>

                </div>
            </div>
        </header>
    );
};

export default HeaderWithBack;