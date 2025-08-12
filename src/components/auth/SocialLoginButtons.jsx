/**
 * 
 * @param onClick
 * @param disabled
 * @returns 
 */
const KakaoLoginButton = ({
    onClick,
    disabled = false
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2
                        px-4 py-2 rounded-lg font-medium
                        bg-[#FEE500] text-black
                        hover:bg-[#FDD835]
                        focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition duration-200`}
        >
            {/* 카카오 로고 (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="#000000" d="M12 3C6.48 3 2 6.94 2 11.5c0 2.54 1.53 4.8 3.88 6.27l-.97 3.56c-.09.35.26.64.58.46l4.04-2.35c.83.15 1.7.23 2.58.23 5.52 0 10-3.94 10-8.5S17.52 3 12 3z"/>
            </svg>
            카카오톡으로 시작하기
        </button>
    );
};

export { KakaoLoginButton };