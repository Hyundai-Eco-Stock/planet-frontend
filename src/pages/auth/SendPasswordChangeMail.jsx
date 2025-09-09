import Swal from "sweetalert2";

import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

import { postPasswordChangeMail } from "@/api/auth/auth.api";


const   SendPasswordChangeMail = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("비밀번호 변경");
    }, [setTitle]);

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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto bg-white min-h-screen">
                <div className="px-6 py-8 pb-32">
                    {/* 입력 라벨 + 필드 */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-900">이메일</label>
                        <CustomCommonInput
                            value={email}
                            placeholder="회원가입시 사용했던 이메일을 입력해주세요"
                            onChange={handleEmail}
                            autoFocus={true}
                            className="w-full min-h-[48px] py-3 px-4 rounded-lg"
                        />
                        <p className="text-xs text-gray-500">계정 인증을 위해 가입 시 사용한 이메일을 입력하세요.</p>
                    </div>
                </div>

                {/* 하단 고정 바 + 버튼 */}
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-4 border-t border-gray-200">
                    <CustomCommonButton
                        onClick={handleSubmit}
                        className="w-full min-h-[48px] py-3 rounded-lg font-bold text-base transition-all duration-200 bg-gradient-to-r from-gray-900 to-black text-white hover:from-black hover:to-gray-900"
                    >
                        비밀번호 변경 메일 발송
                    </CustomCommonButton>
                </div>
            </div>
        </div>
    )
}

export default SendPasswordChangeMail;
