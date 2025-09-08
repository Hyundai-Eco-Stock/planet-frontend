import Swal from "sweetalert2";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { signUpByLocal } from "@/api/auth/auth.api";
import DaumPostcode from "@/components/address/DaumPostcode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

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
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);

    const [sex, setSex] = useState("");
    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");
    const [zonecode, setZonecode] = useState("");
    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{10,}$/;

    useEffect(() => {
        if (password && passwordCheck) {
            setPasswordMatch(password === passwordCheck);
        } else {
            setPasswordMatch(true);
        }
    }, [password, passwordCheck]);

    useEffect(() => {
        if (password) {
            setPasswordValid(passwordRegex.test(password));
        } else {
            setPasswordValid(true);
        }
    }, [password]);

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
        email, name, passwordValid, passwordMatch, password, passwordCheck,
        sex, birthYear, birthMonth, birthDay, address, detailAddress,
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
            email, name, password, profileFile, sex, birth, address, detailAddress,
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto bg-white min-h-screen">
                <div className="px-6 py-8 pb-32">
                    {/* 프로필 업로드 */}
                    <div className="flex flex-col items-center mb-8">
                        <ProfileImageUpload
                            value={profileFile}
                            onChange={handleProfileChange}
                            previewUrl={profileUrl}
                        />
                        <p className="text-sm text-gray-500 mt-3">프로필 사진을 선택해주세요</p>
                    </div>

                    <div className="space-y-6">
                        {/* 이메일 */}
                        <InputField
                            label="이메일"
                            type="email"
                            value={email}
                            placeholder="example@email.com"
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                        />

                        {/* 이름 */}
                        <InputField
                            label="이름"
                            type="text"
                            value={name}
                            placeholder="홍길동"
                            onChange={(e) => setName(e.target.value)}
                        />

                        {/* 비밀번호 */}
                        <div>
                            <PasswordField
                                label="비밀번호"
                                value={password}
                                placeholder="비밀번호를 입력해주세요"
                                onChange={(e) => setPassword(e.target.value)}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                            {password && (
                                <div className="mt-2">
                                    {passwordValid ? (
                                        <p className="text-sm text-green-600 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            사용 가능한 비밀번호입니다
                                        </p>
                                    ) : (
                                        <p className="text-sm text-red-500 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            영문 대소문자, 특수문자 포함 10자 이상
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <PasswordField
                                label="비밀번호 재입력"
                                value={passwordCheck}
                                placeholder="비밀번호를 다시 입력해주세요"
                                onChange={(e) => setPasswordCheck(e.target.value)}
                                showPassword={showPasswordCheck}
                                setShowPassword={setShowPasswordCheck}
                            />
                            {passwordCheck && (
                                <div className="mt-2">
                                    {passwordMatch ? (
                                        <p className="text-sm text-green-600 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            비밀번호가 일치합니다
                                        </p>
                                    ) : (
                                        <p className="text-sm text-red-500 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            비밀번호가 일치하지 않습니다
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 성별 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">성별</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSex("M")}
                                    className={`py-3 rounded-lg border font-medium transition-all ${
                                        sex === "M"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    남자
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSex("F")}
                                    className={`py-3 rounded-lg border font-medium transition-all ${
                                        sex === "F"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    여자
                                </button>
                            </div>
                        </div>

{/* 생년월일 */}
<div>
    <label className="block text-sm font-semibold text-gray-900 mb-3">생년월일</label>
    <div className="flex gap-2">
        {/* 년도 */}
        <div className="flex-1 relative">
            <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full py-3 px-4 pr-8 bg-white border border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all appearance-none text-gray-700"
            >
                <option value="" style={{color: '#9CA3AF'}}>년도</option>
                {Array.from({ length: 100 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    );
                })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        {/* 월 */}
        <div className="flex-1 relative">
            <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                className="w-full py-3 px-4 pr-8 bg-white border border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all appearance-none text-gray-700"
            >
                <option value="" style={{color: '#9CA3AF'}}>월</option>
                {Array.from({ length: 12 }, (_, i) => {
                    const month = String(i + 1).padStart(2, "0");
                    return (
                        <option key={month} value={month}>
                            {month}월
                        </option>
                    );
                })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>

        {/* 일 */}
        <div className="flex-1 relative">
            <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                className="w-full py-3 px-4 pr-8 bg-white border border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all appearance-none text-gray-700"
            >
                <option value="" style={{color: '#9CA3AF'}}>일</option>
                {Array.from({ length: 31 }, (_, i) => {
                    const day = String(i + 1).padStart(2, "0");
                    return (
                        <option key={day} value={day}>
                            {day}일
                        </option>
                    );
                })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    </div>
</div>

                        {/* 주소 */}
                        <div className="mb-12">
                            <label className="block text-sm font-semibold text-gray-900 mb-3">기본 배송지</label>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={zonecode}
                                        placeholder="우편번호"
                                        readOnly
                                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 placeholder-gray-400"
                                    />
                                    <DaumPostcode
                                        onComplete={({ zonecode, address }) => {
                                            setZonecode(zonecode);
                                            setAddress(address);
                                        }}
                                    />
                                </div>

                                <input
                                    type="text"
                                    value={address}
                                    placeholder="기본 주소"
                                    readOnly
                                    className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 placeholder-gray-400"
                                />

                                <input
                                    type="text"
                                    value={detailAddress}
                                    placeholder="상세 주소를 입력해주세요"
                                    onChange={(e) => setDetailAddress(e.target.value)}
                                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none transition-all placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 제출 버튼 */}
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        className={`w-full py-3 rounded-lg font-bold text-base transition-all duration-200 ${
                            isSubmitDisabled
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900"
                        }`}
                    >
                        {isSubmitDisabled ? "정보를 모두 입력해주세요" : "회원 가입"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 컴포넌트들
const ProfileImageUpload = ({ value, onChange, previewUrl }) => {
    const [inputKey, setInputKey] = useState(0);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onChange(file);
        }
    };

    const handleClear = () => {
        onChange(null);
        setInputKey(k => k + 1);
    };

    return (
        <div className="relative">
            <label className="cursor-pointer">
                <input
                    key={inputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                />
                <div className="w-28 h-28 rounded-full border-3 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="프로필 미리보기"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center">
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-xs text-gray-500">사진 선택</p>
                        </div>
                    )}
                </div>
            </label>

            {previewUrl && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                    ×
                </button>
            )}
        </div>
    );
};

const InputField = ({ label, type, value, placeholder, onChange, autoFocus = false }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            autoFocus={autoFocus}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none transition-all placeholder-gray-400"
        />
    </div>
);

const PasswordField = ({ label, value, placeholder, onChange, showPassword, setShowPassword }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className="w-full py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none transition-all placeholder-gray-400"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </button>
            )}
        </div>
    </div>
);

const StyledSelect = ({ value, onChange, placeholder, children }) => (
    <div className="relative flex-1">
        <select
            value={value}
            onChange={onChange}
            className="w-full py-3 px-4 pr-10 border rounded-lg bg-white appearance-none 
                       transition-all outline-none
                       border-gray-200 hover:border-gray-300 
                       focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
                       text-gray-700 shadow-sm"
            style={{ color: value ? '#374151' : '#9CA3AF' }}
        >
            {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
);

export default LocalSignUp;