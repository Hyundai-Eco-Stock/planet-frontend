import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

import { changePassword, validatePasswordChangeToken } from "@/api/auth/auth.api";

const ChangePassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // 에러 모달
    const ErrorModal = () => (
        showErrorModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
                <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">오류</h3>
                        <p className="text-gray-600 mb-6">{errorMessage}</p>
                        <button
                            onClick={() => setShowErrorModal(false)}
                            className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    // 성공 모달
    const SuccessModal = () => (
        showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
                <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">비밀번호 재설정 완료</h3>
                        <p className="text-gray-600 mb-6">비밀번호 변경이 완료되었습니다.</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        >
                            로그인하러 가기
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    // 컴포넌트 마운트 시 푸터 숨기기
    useEffect(() => {
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.display = 'none';
        }

        return () => {
            const footer = document.querySelector('footer');
            if (footer) {
                footer.style.display = 'block';
            }
        };
    }, []);

    useEffect(() => {
        const handleToken = () => {
            validatePasswordChangeToken({ token })
                .catch(() => {
                    setErrorMessage("잘못된 토큰입니다.");
                    setShowErrorModal(true);
                    setTimeout(() => {
                        navigate("/home");
                    }, 2000);
                })
        }

        if (token) {
            handleToken();
        }
    }, [token, navigate])

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }
    
    const handlePasswordAgainChange = (e) => {
        setPasswordAgain(e.target.value);
    }

    const handleSubmit = () => {
        if (!password || !passwordAgain) {
            setErrorMessage("모든 필드를 입력해주세요.");
            setShowErrorModal(true);
            return;
        }

        if (password !== passwordAgain) {
            setErrorMessage("비밀번호가 일치하지 않습니다.");
            setShowErrorModal(true);
            return;
        }

        if (password.length < 8) {
            setErrorMessage("비밀번호는 8자 이상이어야 합니다.");
            setShowErrorModal(true);
            return;
        }

        setIsLoading(true);
        
        changePassword({ token, password })
            .then(() => {
                setShowSuccessModal(true);
            }).catch(() => {
                setErrorMessage("비밀번호 변경에 실패했습니다.");
                setShowErrorModal(true);
            }).finally(() => {
                setIsLoading(false);
            });
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* 로딩 오버레이 */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-lg p-6 shadow-xl">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
                            <p className="text-gray-700">처리 중...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 메인 컨텐츠 */}
            <div className="flex-1 px-6 py-12">
                {/* 제목 */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-black mb-2">비밀번호 재설정</h1>
                    <p className="text-gray-600 text-sm">새로운 비밀번호를 입력해주세요</p>
                </div>

                {/* 폼 */}
                <div className="space-y-6 max-w-md mx-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            새 비밀번호
                        </label>
                        <CustomCommonInput
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="8자 이상 입력해주세요"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호 확인
                        </label>
                        <CustomCommonInput
                            type="password"
                            value={passwordAgain}
                            onChange={handlePasswordAgainChange}
                            placeholder="비밀번호를 다시 입력해주세요"
                        />
                    </div>
                </div>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white p-4 border-t border-gray-200">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !password || !passwordAgain}
                    className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                        isLoading || !password || !passwordAgain
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                    {isLoading ? '처리 중...' : '비밀번호 변경'}
                </button>
            </div>

            {/* 모달들 */}
            <ErrorModal />
            <SuccessModal />
        </div>
    )
}

export default ChangePassword;