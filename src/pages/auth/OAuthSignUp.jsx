import Swal from 'sweetalert2';

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

import useAuthStore from '@/store/authStore';
import "@/main.css"; // 전역 공통 유틸(@layer) 사용
import { signUpByKakao } from "@/api/auth/auth.api";

const OAuthSignUp = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("accessToken");
    const email = queryParams.get("email") || "";
    const nameParam = queryParams.get("name") || "";
    const profileUrlParam = queryParams.get("profileUrl") || "";

    const [name, setName] = useState(nameParam);
    const [profileUrl, setProfileUrl] = useState(profileUrlParam); // 프로필 url
    const [profileFile, setProfileFile] = useState(null); // 파일 원본 저장
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);

    useEffect(() => {
        if (accessToken && email && nameParam) {
            console.log(`accessToken: ${accessToken}`)

            useAuthStore.getState().setAccessToken(accessToken);
            useAuthStore.getState().setEmail(email);
            useAuthStore.getState().setName(name);
            useAuthStore.getState().setProfile(profileUrl);

            // URL에서 토큰 흔적 제거 후 이동(
            // window.history.replaceState({}, "", "/signup");
            navigate("/login", { replace: true });
        }
    }, [accessToken, email, nameParam]);

    useEffect(() => {
        if (password && passwordCheck) {
            setPasswordMatch(password === passwordCheck);
        } else {
            setPasswordMatch(true);
        }
    }, [password, passwordCheck]);

    const handleProfileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileUrl(URL.createObjectURL(file)); // 미리보기 용
            setProfileFile(file); // 서버 전송 용
        }
    };

    const handleSubmit = () => {
        if (!passwordMatch) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        console.log("회원가입 요청");
        signUpByKakao(email, name, password, profileFile)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "회원가입 성공",
                    timer: 1500,
                }).then(() => {
                    navigate("/home");
                });
            }).catch((err) => {
                Swal.fire({
                    icon: "error",
                    title: "회원가입 실패",
                    text: err.response.data,
                    confirmButtonText: "확인",
                });
            });
    };

    const isSubmitDisabled = !passwordMatch || !password || !passwordCheck || !name;

    return (
        <div className="min-h-dvh bg-gray-50 flex flex-col gap-3 px-4 pb-4 pb-safe pt-2">
            {/* Header */}
            <header className="pt-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">회원가입</h1>
                <p className="mt-1 text-[13px] text-gray-500">필수 정보를 입력하고 계정을 만들어주세요.</p>
            </header>

            {/* Card */}
            <main className="bg-white rounded-2xl shadow-md p-4">
                {/* 프로필 */}
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold text-gray-900">프로필</h2>
                    <div className="flex items-center gap-3">
                        <img
                            src={profileUrl || "/placeholder-avatar.svg"}
                            alt="profile"
                            className="w-24 h-24 rounded-full object-cover bg-gray-100 border border-gray-200"
                        />
                        <div className="flex-1">
                            <CustomCommonInput type="file" onChange={handleProfileChange} className="py-2" />
                            <p className="mt-1 text-xs text-gray-500">정사각형 이미지를 추천합니다 (최대 5MB).</p>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gray-200 my-3" />

                {/* 이메일 */}
                <section className="flex flex-col gap-3">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">이메일</label>
                        <CustomCommonInput
                            type="email"
                            value={email}
                            placeholder="이메일을 입력해주세요"
                            readOnly={true}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">이름</label>
                        <CustomCommonInput
                            type="text"
                            value={name}
                            placeholder="이름을 입력해주세요"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">비밀번호</label>
                        <CustomCommonInput
                            type="password"
                            value={password}
                            placeholder="비밀번호를 입력해주세요"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="mt-1 text-xs text-gray-500">영문/숫자/특수문자 조합 8자 이상을 권장합니다.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">비밀번호 재입력</label>
                        <CustomCommonInput
                            type="password"
                            value={passwordCheck}
                            placeholder="비밀번호를 다시 입력해주세요"
                            onChange={(e) => setPasswordCheck(e.target.value)}
                        />
                        {!passwordMatch && (
                            <div className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</div>
                        )}
                    </div>
                </section>
            </main>

            {/* Sticky CTA */}
            <footer className="sticky bottom-0 mt-auto bg-gradient-to-b from-transparent to-gray-50 pt-2 pb-safe">
                <CustomCommonButton
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="btn-primary w-full"
                >
                    회원 가입
                </CustomCommonButton>
            </footer>
        </div>
    );
};

export default OAuthSignUp;