import { useState, useEffect } from "react";

import { fetchMyCarInfo, registerCarInfo, unregisterCarInfo } from "@/api/car/car.api";
import { useOutletContext } from "react-router-dom";
import { fetchCarHistoriesByCarNumber } from "@/api_department_core_backend/car/carAccessHistory.api";

const MyCarInfo = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("내 차량 관리");
    }, [setTitle]);

    const [carNumberLeft, setCarNumberLeft] = useState("");
    const [carNumberMiddle, setCarNumberMiddle] = useState("");
    const [carNumberRight, setCarNumberRight] = useState("");
    const [carInfoExist, setCarInfoExist] = useState(false);
    const [carHistories, setCarHistories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 모달 상태
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // 내 차 정보 등록
    const handleRegisterCarInfo = async () => {
        const carNumber = `${carNumberLeft}${carNumberMiddle}${carNumberRight}`;
        const request = { carNumber };

        try {
            setIsLoading(true);
            await registerCarInfo(request);
            setCarInfoExist(true);
            setSuccessMessage("차량 정보가 성공적으로 등록되었습니다");
            setShowRegisterModal(false);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
            setErrorMessage("차량 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
            setShowRegisterModal(false);
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCarInfo = async () => {
        try {
            setIsLoading(true);
            await unregisterCarInfo();
            setCarNumberLeft("");
            setCarNumberMiddle("");
            setCarNumberRight("");
            setCarInfoExist(false);
            setCarHistories([]);
            setSuccessMessage("차량 정보가 성공적으로 삭제되었습니다");
            setShowDeleteModal(false);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
            setErrorMessage("차량 정보 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
            setShowDeleteModal(false);
            setShowErrorModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleFetchCarInfo = async () => {
            try {
                const data = await fetchMyCarInfo();
                if (data) {
                    const regex = /^(\d{2,3})([가-힣]{1})(\d{4})$/;
                    const match = data.carNumber.match(regex);

                    if (match) {
                        setCarNumberLeft(match[1]);
                        setCarNumberMiddle(match[2]);
                        setCarNumberRight(match[3]);
                    }
                    setCarInfoExist(true);

                    // 차량 기록 조회
                    try {
                        const historyData = await fetchCarHistoriesByCarNumber(data.carNumber);
                        setCarHistories(historyData || []);
                    } catch (historyErr) {
                        console.error("차량 기록 조회 실패:", historyErr);
                    }
                } else {
                    setCarNumberLeft("");
                    setCarNumberMiddle("");
                    setCarNumberRight("");
                    setCarInfoExist(false);
                }
            } catch (err) {
                console.error(err);
                setErrorMessage("차량 정보 조회에 실패했습니다.");
                setShowErrorModal(true);
            }
        };

        handleFetchCarInfo();
    }, []);

    const isFormValid = carNumberLeft.length >= 2 && carNumberMiddle.length === 1 && carNumberRight.length === 4;

    // 모달 컴포넌트들
    const RegisterModal = () => (
        showRegisterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
                    <div className="bg-blue-500 px-6 py-4">
                        <h3 className="text-lg font-bold text-white text-center">차량 등록 확인</h3>
                    </div>
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                                {carNumberLeft} {carNumberMiddle} {carNumberRight}
                            </div>
                            <p className="text-gray-600">위 차량 번호로 등록하시겠습니까?</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRegisterModal(false)}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleRegisterCarInfo}
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                            >
                                {isLoading ? "등록 중..." : "등록"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    const DeleteModal = () => (
        showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
                    <div className="bg-red-500 px-6 py-4">
                        <h3 className="text-lg font-bold text-white text-center">차량 삭제 확인</h3>
                    </div>
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <p className="text-gray-600">등록된 차량 정보를 삭제하시겠습니까?</p>
                            <p className="text-sm text-gray-500 mt-1">삭제 후에는 복구할 수 없습니다.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDeleteCarInfo}
                                disabled={isLoading}
                                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:bg-gray-300"
                            >
                                {isLoading ? "삭제 중..." : "삭제"}
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
                    <div className="bg-blue-500 px-6 py-4">
                        <h3 className="text-lg font-bold text-white text-center">완료</h3>
                    </div>
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-gray-600 mb-6">{successMessage}</p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                        >
                            확인
                        </button>
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
                        <h3 className="text-lg font-bold text-white text-center">오류</h3>
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
            <main className="px-4 py-8 pb-24">
                {/* 안내 메시지 */}
                {!carInfoExist && (
                    <div className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-100 mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">차량 등록 안내</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            차량 번호를 등록하면 주차장 입·출차 내역을 <br />
                            실시간으로 확인할 수 있습니다
                        </p>
                    </div>
                )}

                {/* 차량 번호 섹션 */}
                <div className="mb-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">차량 번호 {carInfoExist ? "확인" : "등록"}</h2>
                        <p className="text-sm text-gray-600">
                            {carInfoExist ? "등록된 차량 번호입니다" : "차량 번호를 정확히 입력해주세요"}
                        </p>
                    </div>

                    {carInfoExist ? (
                        // 등록된 상태 - 큰 카드로 표시
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center shadow-sm">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-700 font-semibold text-sm">등록 완료</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2 tracking-wider">
                                {carNumberLeft} {carNumberMiddle} {carNumberRight}
                            </div>
                            <p className="text-gray-600 text-sm">등록된 차량 번호</p>
                        </div>
                    ) : (
                        // 미등록 상태 - 입력 폼
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={carNumberLeft}
                                        onChange={(e) => setCarNumberLeft(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="123"
                                        maxLength={3}
                                        className="w-full py-4 px-4 border border-gray-300 rounded-xl text-center text-xl font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                    <div className="text-center text-xs text-gray-500 mt-1">차종</div>
                                </div>
                                <div className="w-20">
                                    <input
                                        type="text"
                                        value={carNumberMiddle}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // 한글만 허용하되 조합 중인 텍스트도 고려
                                            if (value.length <= 1) {
                                                setCarNumberMiddle(value);
                                            }
                                        }}
                                        onCompositionStart={() => {
                                            // IME 조합 시작 시 제한 해제
                                        }}
                                        onCompositionEnd={(e) => {
                                            // IME 조합 완료 시 한글 체크
                                            const value = e.target.value;
                                            const koreanChar = value.match(/[가-힣]/)?.[0] || '';
                                            setCarNumberMiddle(koreanChar);
                                        }}
                                        placeholder="가"
                                        maxLength={2} // 조합 중 여유를 위해 2로 설정
                                        className="w-full py-4 px-4 border border-gray-300 rounded-xl text-center text-xl font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        autoComplete="off"
                                        lang="ko"
                                        inputMode="text"
                                    />
                                    <div className="text-center text-xs text-gray-500 mt-1">용도</div>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={carNumberRight}
                                        onChange={(e) => setCarNumberRight(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="1234"
                                        maxLength={4}
                                        className="w-full py-4 px-4 border border-gray-300 rounded-xl text-center text-xl font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                    <div className="text-center text-xs text-gray-500 mt-1">일련번호</div>
                                </div>
                            </div>

                            {/* 실시간 미리보기 */}
                            {(carNumberLeft || carNumberMiddle || carNumberRight) && (
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-sm text-gray-500 mb-1">미리보기</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {carNumberLeft || "___"} {carNumberMiddle || "_"} {carNumberRight || "____"}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 입출차 기록 섹션 */}
                {carHistories.length > 0 && (
                    <div className="mb-8">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">입·출차 기록</h2>
                            <p className="text-sm text-gray-600">최근 차량 출입 내역입니다</p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="max-h-80 overflow-y-auto">
                                {carHistories.map((h, index) => (
                                    <div
                                        key={h.carAccessHistoryId}
                                        className={`px-4 py-4 flex items-center justify-between ${index !== carHistories.length - 1 ? 'border-b border-gray-100' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${h.status === "ENTER"
                                                ? "bg-blue-100"
                                                : h.status === "EXIT"
                                                    ? "bg-orange-100"
                                                    : "bg-gray-100"
                                                }`}>
                                                {h.status === "ENTER" ? (
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                    </svg>
                                                ) : h.status === "EXIT" ? (
                                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {new Date(h.createdAt).toLocaleString("ko-KR", {
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {h.status === "ENTER" ? "입차" : h.status === "EXIT" ? "출차" : h.status}
                                                </div>
                                            </div>
                                        </div>

                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${h.status === "ENTER" ? "bg-blue-100 text-blue-700"
                                                : h.status === "EXIT" ? "bg-orange-100 text-orange-700"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {h.status === "ENTER" ? "입차" : h.status === "EXIT" ? "출차" : h.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border-t border-gray-200 z-50" style={{ height: '85px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="px-4 pt-3 pb-6 h-full flex items-start">
                    {!carInfoExist ? (
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            disabled={!isFormValid}
                            className={`w-full py-3 rounded-xl font-bold text-base transition-all duration-200 ${!isFormValid
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] shadow-lg"
                                }`}
                        >
                            {!isFormValid ? "차량 번호를 완전히 입력해주세요" : "차량 등록하기"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-[0.98] shadow-lg"
                        >
                            차량 정보 삭제
                        </button>
                    )}
                </div>
            </div>

            {/* 모달들 */}
            <RegisterModal />
            <DeleteModal />
            <SuccessModal />
            <ErrorModal />
        </div>
    );
}

export default MyCarInfo;