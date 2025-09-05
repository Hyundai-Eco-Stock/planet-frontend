import Swal from 'sweetalert2';

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

import useAuthStore from '@/store/authStore';
import "@/main.css"; // 전역 공통 유틸(@layer) 사용
import { signUpByKakao } from "@/api/auth/auth.api";
import CustomProfileImageInput from '../../components/_custom/CustomProfileImageInput';
import DaumPostcode from '@/components/address/DaumPostcode';

const OAuthSignUp = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("accessToken");
    const email = queryParams.get("email") || "";
    const nameParam = queryParams.get("name") || "";
    const profileUrlParam = queryParams.get("profileUrl") || "";

    const [name, setName] = useState(nameParam);
    const [profileUrl, setProfileUrl] = useState(profileUrlParam);
    const [profileFile, setProfileFile] = useState(null);
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);

    const [sex, setSex] = useState("");  // 'M' or 'F'
    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");
    const [zonecode, setZonecode] = useState("");
    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    const yearRef = useRef(null);
    const monthRef = useRef(null);
    const dayRef = useRef(null);

    // ✅ 비밀번호 규칙 정규식
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{10,}$/;

    useEffect(() => {
        if (accessToken && email && nameParam) {
            useAuthStore.getState().setLoginStatus(true);
            useAuthStore.getState().setAccessToken(accessToken);
            useAuthStore.getState().setEmail(email);
            useAuthStore.getState().setName(name);
            useAuthStore.getState().setProfile(profileUrl);

            window.history.replaceState({}, "", "/signup");
        }
    }, [accessToken, email, nameParam]);

    // ✅ 비밀번호 확인
    useEffect(() => {
        if (password && passwordCheck) {
            setPasswordMatch(password === passwordCheck);
        } else {
            setPasswordMatch(true);
        }
    }, [password, passwordCheck]);

    // ✅ 비밀번호 규칙
    useEffect(() => {
        if (password) {
            setPasswordValid(passwordRegex.test(password));
        } else {
            setPasswordValid(true);
        }
    }, [password]);

    // ✅ 실시간 버튼 활성/비활성
    useEffect(() => {
        const disabled =
            !passwordValid ||
            !passwordMatch ||
            !password ||
            !passwordCheck ||
            !name.trim() ||
            !sex ||
            !birthYear || birthYear.length !== 4 ||
            !birthMonth || birthMonth.length > 2 ||
            !birthDay || birthDay.length > 2 ||
            !address.trim() ||
            !detailAddress.trim();

        setIsSubmitDisabled(disabled);
    }, [
        passwordValid,
        passwordMatch,
        password,
        passwordCheck,
        name,
        sex,
        birthYear,
        birthMonth,
        birthDay,
        address,
        detailAddress,
    ]);

    const handleProfileChange = (file) => {
        if (file) {
            setProfileUrl(URL.createObjectURL(file));
            setProfileFile(file);
        } else {
            setProfileUrl(null);
            setProfileFile(null);
        }
    };

    const handleSubmit = () => {
        if (isSubmitDisabled) return;

        const birth = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;

        signUpByKakao({
            email,
            name,
            password,
            profileFile,
            sex,
            birth,
            address,
            detailAddress,
        })
            .then((data) => {
                const profileUrl = data.profileUrl;
                useAuthStore.getState().setProfile(profileUrl);
                
                Swal.fire({
                    icon: "success",
                    title: "회원가입 완료!",
                    html: `
                        <p style="font-size:16px; color:#374151;">
                            Planet의 여정에 함께해 주셔서 감사합니다. <br/>
                            지금부터 <b>친환경 혜택</b>을 즐겨보세요! 🌱
                        </p>
                    `,
                    confirmButtonText: "지금 시작하기 🚀",
                    confirmButtonColor: "#10B981",
                    customClass: {
                        popup: "rounded-2xl shadow-xl"
                    }
                }).then(() => {
                    navigate("/home");
                });
            })
            .catch((err) => {
                Swal.fire({
                    icon: "error",
                    title: "회원가입 실패",
                    text: err.response?.data.message || "알 수 없는 오류",
                    confirmButtonText: "확인",
                });
            });
    };

    return (
        <div className="min-h-dvh flex flex-col gap-3 px-4 pb-24 pt-2">
            {/* Header */}
            <header className="pt-1 pb-5 text-center">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">회원가입</h1>
                <p className="mt-1 text-[13px] text-gray-500">필수 정보를 입력하고 계정을 만들어주세요.</p>
            </header>

            {/* Card */}
            <main className="flex flex-col gap-3">
                {/* 프로필 */}
                <section className="flex flex-col gap-2">
                    <h2 className="text-sm font-semibold text-gray-900">프로필</h2>
                    <CustomProfileImageInput
                        value={profileFile}
                        onChange={handleProfileChange}
                        previewUrl={profileUrl}
                    />
                </section>

                {/* 이메일 */}
                <section>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">이메일</label>
                    <CustomCommonInput
                        type="email"
                        value={email}
                        placeholder="이메일을 입력해주세요"
                        readOnly={true}
                    />
                </section>

                {/* 이름 */}
                <section>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">이름</label>
                    <CustomCommonInput
                        type="text"
                        value={name}
                        placeholder="이름을 입력해주세요"
                        readOnly={true}
                        onChange={(e) => setName(e.target.value)}
                    />
                </section>

                {/* 비밀번호 */}
                <section>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">비밀번호</label>
                    <CustomCommonInput
                        type="password"
                        value={password}
                        placeholder="비밀번호를 입력해주세요"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {!passwordValid && (
                        <p className="mt-1 text-xs text-red-500">
                            영문 대소문자, 특수문자를 포함하여 10자 이상 입력해주세요.
                        </p>
                    )}
                    {passwordValid && password && (
                        <p className="mt-1 text-xs text-green-600">사용 가능한 비밀번호입니다.</p>
                    )}
                </section>

                {/* 비밀번호 재입력 */}
                <section>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">비밀번호 재입력</label>
                    <CustomCommonInput
                        type="password"
                        value={passwordCheck}
                        placeholder="비밀번호를 다시 입력해주세요"
                        onChange={(e) => setPasswordCheck(e.target.value)}
                    />
                    {passwordCheck && (
                        passwordMatch ? (
                            <div className="mt-1 text-xs text-green-600">비밀번호가 일치합니다.</div>
                        ) : (
                            <div className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다.</div>
                        )
                    )}
                </section>

                {/* 성별 */}
                <section className="flex flex-col gap-2 mt-3">
                    <label className="text-sm font-semibold text-gray-900">성별</label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className={`flex-1 py-3 rounded-lg border ${sex === "M" ? "bg-emerald-500 text-white" : "bg-white"}`}
                            onClick={() => setSex("M")}
                        >
                            남자
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-3 rounded-lg border ${sex === "F" ? "bg-emerald-500 text-white" : "bg-white"}`}
                            onClick={() => setSex("F")}
                        >
                            여자
                        </button>
                    </div>
                </section>

                {/* 생년월일 */}
                <section className="flex flex-col gap-2 mt-3">
                    <label className="text-sm font-semibold text-gray-900">생년월일</label>
                    <div className="flex gap-2">
                        <CustomCommonInput
                            type="number"
                            value={birthYear}
                            placeholder="YYYY"
                            closeBtnVisible={false}
                            onChange={(e) => {
                                setBirthYear(e.target.value);
                                if (e.target.value.length === 4) {
                                    monthRef.current?.focus();
                                }
                            }}
                            ref={yearRef}
                            maxLength={4}
                        />
                        <span className="m-auto">년</span>
                        <CustomCommonInput
                            type="number"
                            value={birthMonth}
                            placeholder="MM"
                            closeBtnVisible={false}
                            onChange={(e) => {
                                setBirthMonth(e.target.value);
                                if (e.target.value.length === 2) {
                                    dayRef.current?.focus();
                                }
                            }}
                            ref={monthRef}
                            maxLength={2}
                        />
                        <span className="m-auto">월</span>
                        <CustomCommonInput
                            type="number"
                            value={birthDay}
                            placeholder="DD"
                            closeBtnVisible={false}
                            onChange={(e) => { setBirthDay(e.target.value); }}
                            ref={dayRef}
                            maxLength={2}
                        />
                        <span className="m-auto">일</span>
                    </div>
                </section>

                {/* 주소 */}
                <section className="flex flex-col gap-2 mt-3">
                    <label className="text-sm font-semibold text-gray-900">기본 배송지</label>
                    <div className="flex gap-2">
                        <CustomCommonInput
                            type="text"
                            value={zonecode}
                            placeholder="우편번호"
                            readOnly
                            className="flex-1"
                        />
                        <DaumPostcode
                            onComplete={({ zonecode, address }) => {
                                setZonecode(zonecode);
                                setAddress(address);
                            }}
                        />
                    </div>

                    <CustomCommonInput
                        type="text"
                        value={address}
                        placeholder="기본 주소"
                        readOnly
                    />

                    <CustomCommonInput
                        type="text"
                        value={detailAddress}
                        placeholder="상세 주소 입력"
                        onChange={(e) => setDetailAddress(e.target.value)}
                    />
                </section>
            </main>

            {/* Fixed CTA */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white pt-1 pb-8 px-4">
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