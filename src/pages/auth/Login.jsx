import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Planet from '@/assets/navigation_icon/Planet.svg';

import { KakaoLoginButton } from "@/components/auth/SocialLoginButtons";
import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import SpeechBubble from "@/components/auth/SpeechBubble";
import { localLogin } from "@/api/auth/auth.api";
import useAuthStore from "@/store/authStore";

const Login = () => {

    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await localLogin(id, pw);
            const { accessToken, email, name, profileUrl } = response.data;
            useAuthStore.getState().setLoginStatus(true);
            useAuthStore.getState().setAccessToken(accessToken);
            useAuthStore.getState().setEmail(email);
            useAuthStore.getState().setName(name);
            useAuthStore.getState().setProfile(profileUrl);
            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
            // You can add user-facing error handling here, like a toast or a message.
        }
    };

    return (
        <div className="max-w-[640px] px-8 flex justify-center">
            <main className="w-full h-fit-content">
                {/* 제목 */}
                <div className="flex flex-col gap-3 justify-center items-center text-center pt-20 pb-10">
                    <img src={Planet} className="w-24"/>
                    <Link
                        to="/home"
                        className="font-extrabold tracking-[.2px] text-[24px] leading-none no-underline"
                        aria-label="planet 홈으로 이동"
                    >
                        planet
                    </Link>
                </div>

                {/* 폼 */}
                <form onSubmit={onSubmit} className="space-y-4">
                    {/* 아이디 입력 */}
                    <CustomCommonInput
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        placeholder="아이디를 입력하세요."
                        aria-label="아이디"
                        autoFocus={true}
                    />

                    {/* 비밀번호 입력 */}
                    <CustomCommonInput
                        type="password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="비밀번호를 입력하세요."
                        aria-label="비밀번호"
                    />

                    {/* 로그인 버튼 */}
                    <CustomCommonButton
                        type="submit"
                        children="로그인"
                    />
                </form>

                {/* 회원가입 링크 */}
                <div className="text-center mt-6 flex justify-center gap-10">
                    <button
                        type="button"
                        onClick={() => navigate("/signup/local")}
                        className="text-black text-base underline-offset-4 hover:underline"
                    >
                        회원가입하기
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/send/password-change-mail")}
                        className="text-black text-base underline-offset-4 hover:underline"
                    >
                        비밀번호 재설정
                    </button>
                </div>

                {/* 3초 회원가입 말풍선 버튼 */}
                <div className="mt-5 flex justify-center">
                    <SpeechBubble />
                </div>

                {/* 카카오로 계속하기 */}
                <div className="mt-5">
                    <KakaoLoginButton />
                </div>
            </main>
        </div>
    );
}

export default Login;