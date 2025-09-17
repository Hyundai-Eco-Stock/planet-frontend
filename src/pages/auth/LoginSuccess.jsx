import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useAuthStore from '@/store/authStore';
import { useNotifications } from '@/hooks/fcm_notification/useNotifications';

const LoginSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 1) 쿼리 파라미터 읽기
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("accessToken");
    const email = queryParams.get("email");
    const name = queryParams.get("name");
    const profileUrl = queryParams.get("profileUrl");
    const signUpStatus = queryParams.get("signUpStatus") === "true";
    const role = queryParams.get("role");

    useEffect(() => {
        if (accessToken && email && name && role) {
            // 저장
            useAuthStore.getState().setLoginStatus(true);
            useAuthStore.getState().setSignUpStatus(signUpStatus);
            useAuthStore.getState().setProfile(profileUrl);
            useAuthStore.getState().setEmail(email);
            useAuthStore.getState().setName(name);
            useAuthStore.getState().setAccessToken(accessToken);
            useAuthStore.getState().setRole(role);

            // URL에서 토큰 흔적 제거 후 이동
            window.history.replaceState({}, "", "/login/success");
            // signUpStatus에 따라 페이지 이동
            if (signUpStatus) {
                if (role === 'ADMIN') {
                    navigate("/admin/home", { replace: true }); // 뒤로 가기 눌러도 다시 성공 페이지로 안 돌아옴
                } else if (role === 'USER') {
                    navigate("/my-page/main", { replace: true }); // 뒤로 가기 눌러도 다시 성공 페이지로 안 돌아옴
                }
            } else {
                navigate("/signup/oauth", { replace: true });
            }
        }
    }, [accessToken, navigate]);

    return (
        <div style={{ padding: 20 }}>
            <h2>로그인 완료 페이지</h2>
            {accessToken && <p>Access Token 저장 완료</p>}
            <Link to="/home">홈으로</Link>
        </div>
    );
}

export default LoginSuccess;