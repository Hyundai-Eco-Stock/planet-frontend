import Swal from "sweetalert2";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import CustomProfileImageInput from "@/components/_custom/CustomProfileImageInput";
import DaumPostcode from "@/components/address/DaumPostcode";
import { signUpByLocal } from "@/api/auth/auth.api";
import { SimpleSelect } from "@/components/_custom/CustomSelect";

const LocalSignUp = () => {

    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("회원가입");
    }, [setTitle]);

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [profileUrl, setProfileUrl] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [passwordValid, setPasswordValid] = useState(true);

    const [sex, setSex] = useState(""); // 'M' or 'F'
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
            !email.trim() ||
            !name.trim() ||
            !passwordValid ||
            !passwordMatch ||
            !password ||
            !passwordCheck ||
            !sex ||
            !birthYear ||
            birthYear.length !== 4 ||
            !birthMonth ||
            birthMonth.length > 2 ||
            !birthDay ||
            birthDay.length > 2 ||
            !address.trim() ||
            !detailAddress.trim();

        setIsSubmitDisabled(disabled);
    }, [
        email,
        name,
        passwordValid,
        passwordMatch,
        password,
        passwordCheck,
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

        signUpByLocal({
            email,
            name,
            password,
            profileFile,
            sex,
            birth,
            address,
            detailAddress,
        })
            .then(() => {
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
                        popup: "rounded-2xl shadow-xl",
                    },
                }).then(() => {
                    navigate("/login", { replace: true });
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
        <div className="min-h-dvh flex flex-col gap-3 pb-24 pt-2">
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
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        이메일
                    </label>
                    <CustomCommonInput
                        type="email"
                        value={email}
                        placeholder="이메일을 입력해주세요"
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus={true}
                    />
                </section>

                {/* 이름 */}
                <section>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        이름
                    </label>
                    <CustomCommonInput
                        type="text"
                        value={name}
                        placeholder="이름을 입력해주세요"
                        onChange={(e) => setName(e.target.value)}
                    />
                </section>

                {/* 비밀번호 */}
                <section>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        비밀번호
                    </label>
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
                        <p className="mt-1 text-xs text-green-600">
                            사용 가능한 비밀번호입니다.
                        </p>
                    )}
                </section>

                {/* 비밀번호 재입력 */}
                <section>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                        비밀번호 재입력
                    </label>
                    <CustomCommonInput
                        type="password"
                        value={passwordCheck}
                        placeholder="비밀번호를 다시 입력해주세요"
                        onChange={(e) => setPasswordCheck(e.target.value)}
                    />
                    {passwordCheck &&
                        (passwordMatch ? (
                            <div className="mt-1 text-xs text-green-600">
                                비밀번호가 일치합니다.
                            </div>
                        ) : (
                            <div className="mt-1 text-xs text-red-500">
                                비밀번호가 일치하지 않습니다.
                            </div>
                        ))}
                </section>

                {/* 성별 */}
                <section className="flex flex-col gap-2 mt-3">
                    <label className="text-sm font-semibold text-gray-900">성별</label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className={`flex-1 py-3 rounded-lg border ${sex === "M" ? "bg-emerald-500 text-white" : "bg-white"
                                }`}
                            onClick={() => setSex("M")}
                        >
                            남자
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-3 rounded-lg border ${sex === "F" ? "bg-emerald-500 text-white" : "bg-white"
                                }`}
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
                        {/* 연도 */}
                        <SimpleSelect
                            value={birthYear}
                            onChange={(e) => setBirthYear(e.target.value)}
                            options={Array.from({ length: 100 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return { value: year, label: year };
                            })}
                            placeholder="YYYY"
                            className="flex-1"
                            iconVisible={false}
                        />
                        <span className="m-auto">년</span>

                        {/* 월 */}
                        <SimpleSelect
                            value={birthMonth}
                            onChange={(e) => setBirthMonth(e.target.value)}
                            options={Array.from({ length: 12 }, (_, i) => {
                                const month = String(i + 1).padStart(2, "0");
                                return { value: month, label: month };
                            })}
                            placeholder="MM"
                            className="flex-1"
                            iconVisible={false}
                        />
                        <span className="m-auto">월</span>

                        {/* 일 */}
                        <SimpleSelect
                            value={birthDay}
                            onChange={(e) => setBirthDay(e.target.value)}
                            options={Array.from({ length: 31 }, (_, i) => {
                                const day = String(i + 1).padStart(2, "0");
                                return { value: day, label: day };
                            })}
                            placeholder="DD"
                            className="flex-1"
                            iconVisible={false}
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

            <div className="max-w-xl w-full fixed bottom-0 left-1/2 -translate-x-1/2 bg-white p-4 border-t">
                <CustomCommonButton
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="btn-primary w-full"
                >
                    회원 가입
                </CustomCommonButton>
            </div>
        </div>
    );
};

export default LocalSignUp;