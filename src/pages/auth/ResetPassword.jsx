import { useState } from "react";
import { CustomCommonInput } from "../../components/_custom/CustomInputs";
import { CustomCommonButton } from "../../components/_custom/CustomButtons";
import Swal from "sweetalert2";
import { postPasswordResetmail } from "../../api/auth/auth.api";

const ResetPassword = () => {
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

        postPasswordResetmail({ email })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '안내 메일 발송',
                    text: '해당 이메일로 안내 메일을 발송했습니다.',
                    confirmButtonText: '확인',
                    customClass: {
                        confirmButton: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
                    }
                });
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: '서버 에러',
                    text: '일시적인 서버 오류입니다.',
                    confirmButtonText: '확인',
                });
            });

        
    }

    const handleEmail = (e) => {
        setEmail(e.target.value);
    }

    return (
        <div>
            이메일 입력
            <CustomCommonInput
                value={email}
                onChange={handleEmail}
            />
            <CustomCommonButton
                children="전송"
                onClick={handleSubmit}
            />
        </div>
    )
}

export default ResetPassword;