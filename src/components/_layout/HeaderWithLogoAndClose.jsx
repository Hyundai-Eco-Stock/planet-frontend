import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";

/**
 * @param {*} title 제목
 */
const HeaderWithLogoAndClose = ({ title = "", onClose }) => {
    const navigate = useNavigate();

    const onBackClick = () => {
        navigate(-1); // 직전 페이지로 이동
    };

    const onCloseClick = () => {
        if (onClose) {
            onClose();
        } else {
            navigate(-1); // 기본 동작: 뒤로가기
        }
    };

    return (
        <header className="px-4 sticky top-0 z-50 bg-white text-[#0b1020]">
            <div className="flex items-center justify-between py-3 h-16">
                {/* 왼쪽: 로고 */}
                <div className="flex-1">
                    <Link
                        to="/home/main"
                        className="inline-flex items-center gap-2 font-extrabold tracking-[.2px] text-[24px] leading-none text-inherit no-underline"
                        aria-label="planet 홈으로 이동"
                    >
                        planet
                    </Link>
                </div>

                <h1 className="flex-2 font-bold text-xl">{title}</h1>

                {/* 오른쪽: 닫기 버튼 */}
                <div className="flex-1 flex items-center gap-5 justify-end">
                    <button
                        type="button"
                        onClick={onCloseClick}
                        aria-label="닫기"
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-900 hover:bg-gray-200 transition-transform transform hover:-translate-y-[1px]"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-lg" />
                        <span className="sr-only">닫기</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HeaderWithLogoAndClose;