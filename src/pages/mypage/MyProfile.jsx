import { useState, useEffect, useRef } from "react";

import { fetchMemberProfile, updateProfile } from "@/api/member/member.api";
import CustomProfileImageInput from "@/components/_custom/CustomProfileImageInput";

import useAuthStore from "@/store/authStore";
import DaumPostcode from "@/components/address/DaumPostcode";
import { useNavigate, useOutletContext } from "react-router-dom";

const sexInfo = [
    { value: "M", label: "남자" },
    { value: "F", label: "여자" },
];

const MyProfile = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("내 정보 수정");
    }, [setTitle]);

    const navigate = useNavigate();

    const [initialProfile, setInitialProfile] = useState(null);
    const [isChanged, setIsChanged] = useState(false);

    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [profileImageFile, setProfileImageFile] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [sex, setSex] = useState("");
    const [zonecode, setZonecode] = useState("");

    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");

    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    // 모달 상태 관리
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 페이지 렌더링 시 데이터 가져와 넣기
    useEffect(() => {
        fetchMemberProfile()
            .then(({ profileUrl, email, name, sex, birth, address, detailAddress, zipCode }) => {
                console.log("zipCode", zipCode)
                setName(name);
                setEmail(email);
                setSex(sex);
                if (birth) {
                    const [year, month, day] = birth.split("-");
                    setBirthYear(year);
                    setBirthMonth(month);
                    setBirthDay(day);
                }
                setProfileImageUrl(profileUrl);
                if (address) setAddress(address);
                if (detailAddress) setDetailAddress(detailAddress);
                if (zipCode) setZonecode(zipCode);

                // 초기값 저장
                setInitialProfile({
                    name,
                    email,
                    sex,
                    birthYear: birth?.split("-")[0] || "",
                    birthMonth: birth?.split("-")[1] || "",
                    birthDay: birth?.split("-")[2] || "",
                    profileUrl,
                    address,
                    detailAddress,
                    zonecode: zipCode
                });
            })
    }, []);

    useEffect(() => {
        if (!initialProfile) return;

        const changed =
            initialProfile.name !== name ||
            initialProfile.email !== email ||
            initialProfile.sex !== sex ||
            initialProfile.birthYear !== birthYear ||
            initialProfile.birthMonth !== birthMonth ||
            initialProfile.birthDay !== birthDay ||
            initialProfile.profileUrl !== profileImageUrl ||
            initialProfile.address !== address ||
            initialProfile.detailAddress !== detailAddress ||
            initialProfile.zonecode !== zonecode;

        setIsChanged(changed);
    }, [
        name,
        email,
        sex,
        birthYear,
        birthMonth,
        birthDay,
        profileImageUrl,
        address,
        detailAddress,
        zonecode,
        initialProfile
    ]);

    // 실시간 유효성 검사
    useEffect(() => {
        const disabled =
            !name.trim() ||
            !email.trim() ||
            !sex ||
            !birthYear || birthYear.length !== 4 ||
            !birthMonth || birthMonth.length > 2 ||
            !birthDay || birthDay.length > 2 ||
            !address.trim() ||
            !detailAddress.trim();

        setIsSubmitDisabled(disabled);
    }, [name, email, sex, birthYear, birthMonth, birthDay, address, detailAddress, zonecode]);

    // 프로필 이미지 변경 핸들러
    const handleProfileImageChange = (file) => {
        if (file) {
            setProfileImageUrl(URL.createObjectURL(file));
            setProfileImageFile(file);
        } else {
            setProfileImageUrl("");
            setProfileImageFile(null);
        }
    };

    // 비밀번호 확인 후 프로필 업데이트
    const handlePasswordSubmit = async () => {
        if (!password.trim()) return;

        setIsSubmitting(true);
        const birth = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;

        try {
            await updateProfile({
                email,
                name,
                profileImageFile,
                sex,
                birth,
                address,
                detailAddress,
                oldPassword: password,
            });
            
            setShowPasswordModal(false);
            setPassword("");
            setShowSuccessModal(true);
            
            setTimeout(() => {
                navigate("/my-page/main");
                useAuthStore.getState().setProfile(profileImageUrl);
            }, 1500);

        } catch (err) {
            console.log(err);
            
            let errorMsg = "알 수 없는 오류가 발생했습니다.";
            
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            setErrorMessage(errorMsg);
            setShowPasswordModal(false);
            setPassword("");
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitClick = () => {
        setShowPasswordModal(true);
    };

    // 모달 컴포넌트들
    const PasswordModal = () => (
        showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
                    <div className="bg-emerald-500 px-6 py-4">
                        <h3 className="text-lg font-bold text-white text-center">비밀번호 확인</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-4 text-center">현재 비밀번호를 입력하세요</p>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="현재 비밀번호"
                            className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none transition-all mb-6"
                            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPassword("");
                                }}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                disabled={isSubmitting}
                            >
                                취소
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={!password.trim() || isSubmitting}
                                className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "처리중..." : "확인"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    const SuccessModal = () => (
        showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
                    <div className="bg-emerald-500 px-6 py-4">
                        <h3 className="text-lg font-bold text-white text-center">수정 완료</h3>
                    </div>
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-6">프로필이 성공적으로 수정되었습니다</p>
                    </div>
                </div>
            </div>
        )
    );

    const ErrorModal = () => (
        showErrorModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
                    <div className="bg-red-500 px-6 py-4">
                        <h3 className="text-lg font-bold text-white text-center">수정 실패</h3>
                    </div>
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-6">{errorMessage}</p>
                        <button
                            onClick={() => setShowErrorModal(false)}
                            className="w-full py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    return (
        <div className="min-h-screen bg-white">
            <main className="px-4 pb-4 pt-8">
                {/* 프로필 업로드 */}
                <div className="flex flex-col items-center mb-8">
                    <ProfileImageUpload
                        value={profileImageFile}
                        onChange={handleProfileImageChange}
                        previewUrl={profileImageUrl}
                    />
                    <p className="text-sm text-gray-500 mt-3">프로필 사진을 선택해주세요</p>
                </div>

                <div className="space-y-6">
                    {/* 이름 */}
                    <InputField
                        label="이름"
                        type="text"
                        value={name}
                        placeholder="이름을 입력해주세요"
                        onChange={(e) => setName(e.target.value)}
                        readOnly={true}
                    />

                    {/* 이메일 */}
                    <InputField
                        label="이메일"
                        type="email"
                        value={email}
                        placeholder="이메일을 입력해주세요"
                        readOnly={true}
                    />

                    {/* 성별 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">성별</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSex("M")}
                                className={`py-2.5 rounded-lg border font-medium transition-all ${
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
                                className={`py-2.5 rounded-lg border font-medium transition-all ${
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
                                    className="w-full py-2.5 px-3 pr-8 bg-white border border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all appearance-none text-gray-700"
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
                                    className="w-full py-2.5 px-3 pr-8 bg-white border border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all appearance-none text-gray-700"
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
                                    className="w-full py-2.5 px-3 pr-8 bg-white border border-gray-200 rounded-lg focus:border-emerald-500 outline-none transition-all appearance-none text-gray-700"
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
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">기본 배송지</label>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={zonecode}
                                    placeholder="우편번호"
                                    readOnly
                                    className="flex-1 py-2.5 px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 placeholder-gray-400"
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
                                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 placeholder-gray-400"
                            />

                            <input
                                type="text"
                                value={detailAddress}
                                placeholder="상세 주소를 입력해주세요"
                                onChange={(e) => setDetailAddress(e.target.value)}
                                className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none transition-all placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* 제출 버튼 */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50" style={{ height: '85px' }}>
                <div className="px-4 pt-3 pb-6 h-full flex items-start">
                    <button
                        onClick={handleSubmitClick}
                        disabled={!isChanged || isSubmitDisabled}
                        className={`w-full py-3 rounded-lg font-bold text-base transition-all duration-200 ${
                            (!isChanged || isSubmitDisabled)
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                        }`}
                    >
                        {!isChanged ? "변경사항이 없습니다" : isSubmitDisabled ? "정보를 모두 입력해주세요" : "수정 완료"}
                    </button>
                </div>
            </div>

            {/* 모달들 */}
            <PasswordModal />
            <SuccessModal />
            <ErrorModal />
        </div>
    );
};

// 프로필 이미지 업로드 컴포넌트
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
                <div className="w-32 h-32 rounded-full border-3 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="프로필 미리보기"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center">
                            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm text-gray-500">사진 선택</p>
                        </div>
                    )}
                </div>
            </label>

            {previewUrl && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                    ×
                </button>
            )}
        </div>
    );
};

// 입력 필드 컴포넌트
const InputField = ({ label, type, value, placeholder, onChange, readOnly = false }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            readOnly={readOnly}
            className={`w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:border-emerald-500 outline-none transition-all placeholder-gray-400 ${
                readOnly ? 'bg-gray-50 text-gray-600' : ''
            }`}
        />
    </div>
);

export default MyProfile;