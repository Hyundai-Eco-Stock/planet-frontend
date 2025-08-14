import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { KakaoLoginButton } from "@/components/auth/SocialLoginButtons";
import { CustomCommonInput } from "../../components/_custom/CustomInputs";
import { CustomCommonButton } from "../../components/_custom/CustomButtons";
import SpeechBubble from "../../components/auth/SpeechBubble";

const Login = () => {

    const handleLocalLogin = () => {

    }

    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [pw, setPw] = useState("");

    const onSubmit = (e) => {
        e.preventDefault();
        // TODO: 로그인 API 연동
    };

    return (
        <div className="mx-auto max-w-[640px] px-6 pt-16 pb-28">
            {/* 제목 */}
            <h1 className="text-center text-3xl font-extrabold tracking-tight mb-10">로그인</h1>

            {/* 폼 */}
            <form onSubmit={onSubmit} className="space-y-4">
                {/* 아이디 입력 */}
                <CustomCommonInput
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="아이디를 입력하세요."
                    aria-label="아이디"
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
                    onClick={handleLocalLogin}
                />
            </form>

            {/* 회원가입 링크 */}
            <div className="text-center mt-6">
                <button
                    type="button"
                    onClick={() => navigate("/signup/local")}
                    className="text-black text-base underline-offset-4 hover:underline"
                >
                    회원가입하기
                </button>
            </div>

            {/* 3초 회원가입 말풍선 버튼 */}
            <div className="mt-5 flex justify-center">
                <SpeechBubble/>
            </div>

            {/* 카카오로 계속하기 */}
            <div className="mt-5">
                <KakaoLoginButton />
            </div>
        </div>
    );
}

export default Login;