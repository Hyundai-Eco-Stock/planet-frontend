import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import ReceiptBarcodeScanner from "@/components/barcode/ReceiptBarcodeScanner";
import ReceiptBarcodeFromImage from "@/components/barcode/ReceiptBarcodeFromImage";
import { certificatePaperBagNoUse } from "@/api/eco_stock_certificate/ecoStockCertificate.api";
import { useOutletContext } from "react-router-dom";

const PaperBagNoUseCertificate = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("종이백 미사용 인증");
    }, [setTitle]);

    const [code, setCode] = useState("");
    const [mode, setMode] = useState("scan");

    const handleSubmit = () => {
        if (!code) {
            Swal.fire({
                icon: "error",
                title: "인증 실패",
                text: "영수증 바코드를 스캔하거나 업로드하여 인식해 주세요.",
                confirmButtonText: "확인",
            });
            return;
        }

        certificatePaperBagNoUse(code)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "인증 성공",
                    text: "제로잭 에코스톡 1개 발급 성공!",
                    showDenyButton: true,
                    confirmButtonText: "에코스톡 차트 바로 가기",
                    denyButtonText: "홈으로 가기",
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/eco-stock/main";
                    } else if (result.isDenied) {
                        window.location.href = "/home/main";
                    }
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: "error",
                    title: "인증 실패",
                    text: error.response?.data?.message || "서버 오류가 발생했습니다.",
                    confirmButtonText: "확인",
                });
            });
    };

    return (
        <div className="min-h-screen bg-white">
            <main className="px-4 py-8 pb-24">
                {/* 안내 메시지 */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-green-100 mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">종이백 미사용 인증</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        종이백을 사용하지 않은 영수증을 인증하면 <br />
                        제로잭 에코스톡을 받을 수 있습니다
                    </p>
                </div>

                {/* 인증 방법 선택 */}
                <div className="mb-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">인증 방법 선택</h2>
                        <p className="text-sm text-gray-600">편리한 방법으로 영수증을 인증해주세요</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
                        <div className="grid grid-cols-3">
                            <button
                                type="button"
                                onClick={() => setMode("scan")}
                                className={`px-4 py-4 text-sm font-medium transition-all duration-200 ${
                                    mode === "scan" 
                                        ? "bg-emerald-500 text-white" 
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                카메라 스캔
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("upload")}
                                className={`px-4 py-4 text-sm font-medium border-l border-r border-gray-200 transition-all duration-200 ${
                                    mode === "upload" 
                                        ? "bg-emerald-500 text-white" 
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                이미지 업로드
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("personal")}
                                className={`px-4 py-4 text-sm font-medium transition-all duration-200 ${
                                    mode === "personal" 
                                        ? "bg-emerald-500 text-white" 
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                직접 입력
                            </button>
                        </div>
                    </div>

                    {/* 스캔/업로드 영역 - 박스 제거 */}
                    {mode === "scan" && (
                        <div className="mb-6">
                            <ReceiptBarcodeScanner onDetected={(text) => setCode(text)} />
                        </div>
                    )}
                    
                    {mode === "upload" && (
                        <div className="mb-6">
                            <ReceiptBarcodeFromImage onDetected={(text) => setCode(text)} />
                        </div>
                    )}
                </div>

                {/* 인식된 값 */}
                <div className="mb-8">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">인식된 값</h2>
                        <p className="text-sm text-gray-600">영수증 바코드 번호가 자동으로 입력됩니다</p>
                    </div>
                    
                    <CustomCommonInput
                        value={code}
                        onChange={(vOrEvent) =>
                            setCode(
                                vOrEvent?.target?.value !== undefined
                                    ? vOrEvent.target.value
                                    : vOrEvent
                            )
                        }
                        placeholder="영수증 바코드 번호를 입력하세요"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-200"
                    />
                </div>
            </main>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border-t border-gray-200 z-50" style={{ height: '85px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="px-4 pt-3 pb-6 h-full flex items-start">
                    <CustomCommonButton 
                        onClick={handleSubmit}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                        인증하기
                    </CustomCommonButton>
                </div>
            </div>
        </div>
    );
};

export default PaperBagNoUseCertificate;