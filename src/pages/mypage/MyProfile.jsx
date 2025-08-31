import Swal from "sweetalert2";
import { useState, useEffect, useRef } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { fetchMemberProfile, updateProfile } from "@/api/member/member.api";
import CustomProfileImageInput from "@/components/_custom/CustomProfileImageInput";

import useAuthStore from "@/store/authStore";
import DaumPostcode from "@/components/address/DaumPostcode";

const MyProfile = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [sex, setSex] = useState(""); // 'M' or 'F'
    const [zonecode, setZonecode] = useState(""); // 'M' or 'F'

    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");

    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");   // 프로필 이미지 미리보기
    const [profileImageFile, setProfileImageFile] = useState(null); // 서버 전송용 파일

    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true); // ✅ 버튼 활성화 상태

    const yearRef = useRef(null);
    const monthRef = useRef(null);
    const dayRef = useRef(null);

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
    }, [name, email, sex, birthYear, birthMonth, birthDay, address, detailAddress]);

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

    // 제출 핸들러
    const handleSubmit = async () => {
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
            });
            Swal.fire({ icon: "success", title: "프로필이 수정되었습니다.", timer: 1500 });
            useAuthStore.getState().setProfile(profileImageUrl);
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

    // 페이지 렌더링 시 데이터 가져와 넣기
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchMemberProfile();
            setName(data.name);
            setEmail(data.email);
            setSex(data.sex);
            if (data.birth) {
                const [year, month, day] = data.birth.split("-");
                setBirthYear(year);
                setBirthMonth(month);
                setBirthDay(day);
            }
            setProfileImageUrl(data.profileUrl);
            setAddress(data.address);
            setDetailAddress(data.detailAddress);
        };
        fetchData();
    }, []);

    return (
        <div className="flex flex-col gap-3">
            {/* 프로필 이미지 */}
            <section className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">프로필</span>
                <CustomProfileImageInput
                    value={profileImageFile}
                    onChange={handleProfileImageChange}
                    previewUrl={profileImageUrl}
                />
            </section>

            <label className="block">
                <span className="text-sm font-semibold">이름</span>
                <CustomCommonInput
                    value={name}
                    placeholder="이름을 입력하세요."
                    onChange={(e) => setName(e.target.value)}
                    readOnly={true}
                />
            </label>

            <label className="block">
                <span className="text-sm font-semibold">이메일</span>
                <CustomCommonInput
                    value={email}
                    placeholder="이메일을 입력하세요."
                    readOnly={true}
                />
            </label>

            {/* 성별 */}
            <label className="block">
                <span className="text-sm font-semibold">성별</span>
                <div className="flex gap-3">
                    <button
                        type="button"
                        className={`px-4 py-4 flex-1 rounded-lg border ${sex === "M" ? "bg-emerald-500 text-white" : "bg-white"}`}
                        onClick={() => setSex("M")}
                    >
                        남자
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-4 flex-1 rounded-lg border ${sex === "F" ? "bg-emerald-500 text-white" : "bg-white"}`}
                        onClick={() => setSex("F")}
                    >
                        여자
                    </button>
                </div>
            </label>

            {/* 생년월일 */}
            <label className="block">
                <span className="text-sm font-semibold">생년월일</span>
                <div className="flex gap-2">
                    <CustomCommonInput
                        type="number"
                        value={birthYear}
                        placeholder="YYYY"
                        onChange={(e) => {
                            setBirthYear(e.target.value);
                            if (e.target.value.length === 4) {
                                monthRef.current?.focus();
                            }
                        }}
                        ref={yearRef}
                    />
                    <CustomCommonInput
                        type="number"
                        value={birthMonth}
                        placeholder="MM"
                        onChange={(e) => {
                            setBirthMonth(e.target.value);
                            if (e.target.value.length === 2) {
                                dayRef.current?.focus();
                            }
                        }}
                        ref={monthRef}
                    />
                    <CustomCommonInput
                        type="number"
                        value={birthDay}
                        placeholder="DD"
                        onChange={(e) => setBirthDay(e.target.value)}
                        ref={dayRef}
                    />
                </div>
            </label>

            {/* 주소 */}
            <section className="flex flex-col">
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
                        placeholder="상세 주소 입력"
                        onChange={(e) => setDetailAddress(e.target.value)}
                    />
                </div>
            </section>

            <footer className="fixed bottom-0 left-0 right-0 bg-white pt-1 pb-2 px-4">
                <CustomCommonButton
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="btn-primary w-full"
                >
                    수정
                </CustomCommonButton>
            </footer>
        </div>
    );
};

export default MyProfile;