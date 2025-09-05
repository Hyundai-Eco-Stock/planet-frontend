import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

/**
 * @param {*} title 제목
 */
const HeaderWithBack = ({ title = "" }) => {
    const navigate = useNavigate();

    const onBackClick = () => {
        navigate(-1); // 직전 페이지로 이동
    };

    return (
        <header className="sticky top-0 z-50 bg-white text-[#0b1020]">
            <div className="px-4 flex items-center justify-between py-3 h-16">
                {/* 왼쪽: 뒤로가기 버튼 */}
                <div className="flex-1 flex items-center justify-start">
                    <button
                        type="button"
                        onClick={onBackClick}
                        aria-label="뒤로가기"
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-900 hover:bg-gray-200 transition-transform transform hover:-translate-y-[1px]"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
                    </button>
                </div>

                <h1 className="flex-2 text-center font-bold text-xl">{title}</h1>

                {/* 오른쪽 비워둠 */}
                <div className="flex-1 items-center justify-end"></div>
            </div>
        </header>
    );
};

export default HeaderWithBack;