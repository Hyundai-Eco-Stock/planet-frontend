/**
 * @param disabled
 * @returns 
 */
const KakaoLoginButton = ({
    disabled = false
}) => {

    const handleKakaoLogin = () => {
        window.location.href = `${import.meta.env.VITE_APP_BASE_API_BASE_URL}/oauth2/authorization/kakao`;
    }

    return (
        <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={disabled}
            className="w-full py-4 rounded-xl text-lg font-extrabold 
                bg-[#FEE500] hover:brightness-95 
                active:translate-y-[1px] transition 
                flex items-center justify-center gap-3"
        >
            {/* 카카오 말풍선 아이콘 대체 — 텍스트/이모지 사용 또는 SVG 넣기 */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="#000000" d="M12 3C6.48 3 2 6.94 2 11.5c0 2.54 1.53 4.8 3.88 6.27l-.97 3.56c-.09.35.26.64.58.46l4.04-2.35c.83.15 1.7.23 2.58.23 5.52 0 10-3.94 10-8.5S17.52 3 12 3z" />
            </svg>
            카카오톡으로 계속하기
        </button>
    );
};

export { KakaoLoginButton };