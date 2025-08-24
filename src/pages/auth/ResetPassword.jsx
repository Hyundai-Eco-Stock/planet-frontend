import Swal from "sweetalert2";

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

import { resetPassword, validatePasswordResetToken } from "@/api/auth/auth.api";


const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const [password, setPassword] = useState();
    const [passwordAgain, setPasswordAgain] = useState();

    useEffect(() => {
        const handleToken = () => {
            validatePasswordResetToken({ token })
                .catch(() => {
                    Swal.fire({
                        icon: 'error',
                        title: '잘못된 URL',
                        text: '잘못된 토큰입니다.',
                        confirmButtonText: '홈으로 이동',
                    }).then(() => {
                        navigate("/home");
                    });
                })
        }

        handleToken();
    }, [])

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }
    const handlePasswordAgainChange = (e) => {
        setPasswordAgain(e.target.value);
    }

    const handleSubmit = () => {
        resetPassword({ token, password })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: '비밀번호 재설정 완료',
                    text: '비밀번호 변경이 완료되었습니다.',
                    confirmButtonText: '확인',
                }).then(() => {
                    navigate("/login");
                });
            }).catch(() => {

            })
    }

    return (
        <div>
            <label>
                <span>비밀번호</span>
                <CustomCommonInput
                    value={password}
                    onChange={handlePasswordChange}
                />
            </label>

            <label>
                <span>비밀번호 확인</span>
                <CustomCommonInput
                    value={passwordAgain}
                    onChange={handlePasswordAgainChange}
                />
            </label>

            <CustomCommonButton
                onClick={handleSubmit}
                children="비밀번호 재설정"
            />
        </div>
    )
}

export default ResetPassword;