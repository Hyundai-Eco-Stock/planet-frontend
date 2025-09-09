import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/**
 * @param {*} title 제목
 */
const HeaderWithLogo = ({ title = "", onClose }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <header 
            className="px-4 sticky top-0 z-50 bg-white border-b border-gray-200" 
            style={{backgroundColor: '#ffffff', height: '48px'}}
        >
            <div className="flex items-center justify-between h-full">
                {/* 왼쪽: 뒤로가기 버튼 */}
                <button
                    onClick={handleBack}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="뒤로가기"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                
                {/* 중앙: 제목 */}
                <h1 className="font-semibold text-lg text-gray-900 absolute left-1/2 transform -translate-x-1/2">
                    {title}
                </h1>

                {/* 오른쪽: 빈 공간 (대칭을 위해) */}
                <div className="w-8 h-8"></div>
            </div>
        </header>
    );
};

export default HeaderWithLogo;