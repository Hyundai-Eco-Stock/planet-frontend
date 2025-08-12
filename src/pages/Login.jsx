import { KakaoLoginButton } from "../components/auth/SocialLoginButtons";

export default function Login() {

    const kakaoLogin = () => {
        window.location.href = `${import.meta.env.VITE_APP_BASE_API_BASE_URL}/oauth2/authorization/kakao`;
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>로그인</h2>
            <KakaoLoginButton onClick={kakaoLogin}/>
        </div>
    );
}