import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

const HeaderWithLogoAndSetting = ({ title = "" }) => {
    const navigate = useNavigate();

    const onSettingClick = () => {
        navigate("/my-page/settings"); // 원하는 설정 페이지 경로로 이동
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

                {/* 오른쪽: 설정 + 닫기 버튼 */}
                <div className="flex-1 flex items-center gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onSettingClick}
                        aria-label="설정"
                        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-900 hover:bg-gray-200 transition-transform transform hover:-translate-y-[1px]"
                    >
                        <FontAwesomeIcon icon={faCog} className="text-lg" />
                        <span className="sr-only">설정</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HeaderWithLogoAndSetting;