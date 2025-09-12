import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import SpeechBubble from "@/components/auth/SpeechBubble";
import { KakaoLoginButton } from "@/components/auth/SocialLoginButtons";
import { CustomCommonInput } from "@/components/_custom/CustomInputs";

import { localLogin } from "@/api/auth/auth.api";

import useAuthStore from "@/store/authStore";
import { useNotifications } from '@/hooks/fcm_notification/useNotifications';
import Swal from "sweetalert2";

const Login = () => {

    const navigate = useNavigate();

    const [id, setId] = useState("");
    const [pw, setPw] = useState("");

    const { requestToPermitPushNotification } = useNotifications();

    const onSubmit = async (e) => {
        e.preventDefault();
        localLogin(id, pw)
            .then(({ accessToken, email, name, profileUrl, role }) => {
                console.log(accessToken, email, name, profileUrl, role);

                useAuthStore.getState().setLoginStatus(true);
                useAuthStore.getState().setSignUpStatus(true);
                useAuthStore.getState().setAccessToken(accessToken);
                useAuthStore.getState().setEmail(email);
                useAuthStore.getState().setName(name);
                useAuthStore.getState().setProfile(profileUrl);
                useAuthStore.getState().setRole(role);

                requestToPermitPushNotification();

                if (role == "ADMIN") navigate("/admin/home");
                else navigate("/my-page/main");
            }).catch((error) => {
                console.error("Login failed:", error);
                Swal.fire({
                    icon: "error",
                    title: "로그인 실패",
                    text: "올바르지 않은 아이디 또는 비밀번호입니다.",
                    confirmButtonText: "확인"
                });
            })
    };

    return (
        <div className="bg-white">
            <div className="w-full flex justify-center">
                <main className="w-full max-w-[640px]">
                    {/* 제목 */}
                    <div className="flex flex-col gap-3 justify-center items-center text-center pt-20 pb-10">
                        <Link
                            to="/home"
                            className="font-extrabold tracking-wider text-4xl leading-none no-underline text-black"
                            aria-label="planet 홈으로 이동"
                        >
                            planet
                        </Link>
                    </div>

                    {/* 폼 */}
                    <form onSubmit={onSubmit} className="space-y-4 px-4">
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

                        {/* 로그인 버튼 - 초록색으로 변경, 카카오 버튼과 동일한 스타일 */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                        >
                            로그인
                        </button>
                    </form>

                    {/* 카카오로 계속하기 */}
                    <div className="mt-5 px-4">
                        <KakaoLoginButton />
                    </div>

                    {/* 회원가입 링크 - 하단으로 이동 */}
                    <div className="text-center mt-8 flex justify-center gap-6 px-4">
                        <button
                            type="button"
                            onClick={() => navigate("/signup/local")}
                            className="text-gray-600 text-sm hover:text-black transition-colors"
                        >
                            회원가입하기
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                            type="button"
                            onClick={() => navigate("/send/password-change-mail")}
                            className="text-gray-600 text-sm hover:text-black transition-colors"
                        >
                            비밀번호 재설정
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Login;