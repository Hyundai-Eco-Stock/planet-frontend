import Swal from "sweetalert2";
import { useState, useEffect, useRef } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { fetchMemberProfile, updateProfile } from "@/api/member/member.api";
import CustomProfileImageInput from "@/components/_custom/CustomProfileImageInput";

import useAuthStore from "@/store/authStore";
import DaumPostcode from "@/components/address/DaumPostcode";
import { useNavigate, useOutletContext } from "react-router-dom";
import { SimpleSelect } from "@/components/_custom/CustomSelect";

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

    const [profileImageUrl, setProfileImageUrl] = useState("");   // 프로필 이미지 미리보기
    const [profileImageFile, setProfileImageFile] = useState(null); // 서버 전송용 파일

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [sex, setSex] = useState(""); // 'M' or 'F'
    const [zonecode, setZonecode] = useState("");

    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");

    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");

    // const [newPassword, setNewPassword] = useState("");
    // const [newPasswordAgain, setNewPasswordAgain] = useState("");

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // 버튼 활성화 상태

    const yearRef = useRef(null);
    const monthRef = useRef(null);
    const dayRef = useRef(null);

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

    // ✅ 실시간 유효성 검사
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

    const handleSubmitWithPassword = async () => {

        const _handleSubmit = async (oldPassword) => {
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
                    oldPassword,
                });
                Swal.fire({
                    icon: "success",
                    title: "프로필이 수정되었습니다.",
                    timer: 1500
                }).then(() => {
                    navigate("/my-page/main");
                    useAuthStore.getState().setProfile(profileImageUrl);
                })
            } catch (err) {
                console.log(err);
                Swal.fire({
                    icon: "error",
                    title: "수정 실패",
                    text: err.response?.data.message || "알 수 없는 오류",
                    confirmButtonText: "확인",
                });
            }
        };

        const { value: oldPassword } = await Swal.fire({
            title: "비밀번호 확인",
            input: "password",
            inputPlaceholder: "현재 비밀번호를 입력하세요",
            inputAttributes: {
                autocapitalize: "off",
                autocorrect: "off",
            },
            showCancelButton: true,
            confirmButtonText: "확인",
            cancelButtonText: "취소",
            confirmButtonColor: "#10B981",
        });

        if (oldPassword) {
            await _handleSubmit(oldPassword);
        }
    };

    return (
        <div className="flex flex-col gap-3 pb-24">
            {/* 프로필 이미지 */}
            <section className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-gray-900">프로필</span>
                <CustomProfileImageInput
                    value={profileImageFile}
                    onChange={handleProfileImageChange}
                    previewUrl={profileImageUrl}
                />
            </section>

            {/* 이름 */}
            <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">이름</span>
                <CustomCommonInput
                    value={name}
                    placeholder="이름을 입력해주세요."
                    onChange={(e) => setName(e.target.value)}
                    readOnly={true}
                />
            </label>

            {/* 이메일 */}
            <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">이메일</span>
                <CustomCommonInput
                    value={email}
                    placeholder="이메일을 입력해주세요."
                    readOnly={true}
                />
            </label>

            {/* 성별 */}
            <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">성별</span>
                <div className="flex gap-3">
                    {sexInfo.map(({ value, label }) => (
                        <button
                            key={value}
                            type="button"
                            className={`px-4 py-4 flex-1 rounded-xl border ${sex === value ? "bg-emerald-500 text-white" : "bg-white"}`}
                            onClick={() => setSex(value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </label>

            {/* 생년월일 */}
            <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">생년월일</span>
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
            </label>

            {/* 주소 */}
            <section className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">기본 배송지</label>

                <div className="flex flex-col gap-2">
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
                        placeholder="상세 주소를 입력해주세요."
                        onChange={(e) => setDetailAddress(e.target.value)}
                    />
                </div>
            </section>

            {/* <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold">[선택] 새로운 비밀번호</span>
                <CustomCommonInput
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value) }}
                    placeholder="새로운 비밀번호를 입력해주세요."
                />
                <CustomCommonInput
                    type="password"
                    value={newPasswordAgain}
                    onChange={(e) => { setNewPasswordAgain(e.target.value) }}
                    placeholder="비밀번호를 다시 한번 입력해주세요."
                />
            </label> */}

            <div className="max-w-xl w-full fixed bottom-0 left-1/2 -translate-x-1/2 bg-white p-4 border-t">
                <CustomCommonButton
                    onClick={handleSubmitWithPassword}
                    disabled={!isChanged || isSubmitDisabled}
                    className="btn-primary w-full"
                >
                    수정
                </CustomCommonButton>
            </div>
        </div>
    );
};

export default MyProfile;