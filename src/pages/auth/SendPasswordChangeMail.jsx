import Swal from "sweetalert2";

import { useState } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

import { postPasswordChangeMail } from "@/api/auth/auth.api";


const SendPasswordChangeMail = () => {
    const [email, setEmail] = useState("");

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = () => {

        if (!email) {
            Swal.fire({
                icon: 'warning',
                title: '이메일 입력 필요',
                text: '이메일을 입력해주세요.',
                confirmButtonText: '확인'
            });
            return;
        }

        if (!validateEmail(email)) {
            Swal.fire({
                icon: 'error',
                title: '잘못된 이메일',
                text: '올바른 이메일 형식이 아닙니다.',
                confirmButtonText: '확인'
            });
            return;
        }

        postPasswordChangeMail({ email })
            .then(() => {

            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: '서버 에러',
                    text: '일시적인 서버 오류입니다.',
                    confirmButtonText: '확인',
                });
            });

        Swal.fire({
            icon: 'success',
            title: '메일 발송 완료',
            text: '비밀번호 변경 안내 메일을 발송했습니다.',
            confirmButtonText: '확인',
            customClass: {
                confirmButton: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
            }
        });

    }

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }

    return (
        <div className="w-full pt-5">
            <label className="w-full flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-900">이메일 입력</span>
                <CustomCommonInput
                    value={email}
                    placeholder="회원가입시 사용했던 이메일을 입력해주세요"
                    onChange={handleEmail}
                />
            </label>

            {/* Fixed CTA */}
            <footer className="fixed bottom-28 left-0 right-0 bg-white pt-1 pb-2 px-4">
                <CustomCommonButton
                    onClick={handleSubmit}
                    // disabled={isSubmitDisabled}
                    className="btn-primary w-full"
                >
                    비밀번호 변경 메일 발송
                </CustomCommonButton>
            </footer>
        </div>
    )
}

export default SendPasswordChangeMail;