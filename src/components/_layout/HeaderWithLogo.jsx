import { Link, useNavigate } from "react-router-dom";

/**
 * @param {*} title 제목
 */
const HeaderWithLogo = ({ title = "", onClose }) => {

    return (
        <header className="px-4 sticky top-0 z-50 bg-white text-[#0b1020]">
            <div className="flex items-center justify-between py-3 h-16">
                {/* 왼쪽: 로고 */}
                <Link
                    to="/home/main"
                    className="inline-flex items-center gap-2 font-extrabold tracking-[.2px] text-[24px] leading-none text-inherit no-underline"
                    aria-label="planet 홈으로 이동"
                >
                    planet
                </Link>

                <h1 className="font-bold text-xl">{title}</h1>

                {/* 오른쪽: 닫기 버튼 */}
                <div className="flex items-center gap-5">
                </div>
            </div>
        </header>
    );
};

export default HeaderWithLogo;