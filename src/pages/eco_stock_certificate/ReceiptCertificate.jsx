import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { CustomCommonInput } from "@/components/_custom/CustomInputs";

// 바코드 입력 공용
import ReceiptBarcodeScanner from "@/components/barcode/ReceiptBarcodeScanner";
import ReceiptBarcodeFromImage from "@/components/barcode/ReceiptBarcodeFromImage";

// API
import { certificatePaperBagNoUse, certificateTumbler } from "@/api/eco_stock_certificate/ecoStockCertificate.api";

const ReceiptCertificate = () => {
    const { setTitle } = useOutletContext();

    const [tab, setTab] = useState("paperbag"); // 'paperbag' | 'tumbler'
    const [mode, setMode] = useState("scan"); // 'scan' | 'upload' | 'personal'
    const [code, setCode] = useState("");

    useEffect(() => {
        if (tab === "paperbag") {
            setTitle("종이백 미사용 인증");
        } else {
            setTitle("텀블러 사용 인증");
        }
    }, [tab, setTitle]);

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

        const apiCall = tab === "paperbag" ? certificatePaperBagNoUse : certificateTumbler;

        apiCall(code)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "인증 성공",
                    text:
                        tab === "paperbag"
                            ? "제로백 에코스톡 1개 발급 성공!"
                            : "제로컵 에코스톡 1개 발급 성공!",
                    showDenyButton: true,
                    confirmButtonText: "차트 바로 가기",
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
        <div className="max-w-xl w-full pt-8 text-center">
            <div className="space-y-6">
                {/* 탭: 종이백 / 텀블러 */}
                <div className="w-full flex rounded-lg border overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setTab("paperbag")}
                        className={`flex-1 px-4 py-3 text-sm ${tab === "paperbag" ? "bg-gray-900 text-white" : "bg-white"
                            }`}
                    >
                        종이백 미사용
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("tumbler")}
                        className={`flex-1 px-4 py-3 text-sm border-l ${tab === "tumbler" ? "bg-gray-900 text-white" : "bg-white"
                            }`}
                    >
                        텀블러 사용
                    </button>
                </div>

                {/* 입력 방식 선택 */}
                <div>
                    <div className="flex w-full rounded-lg border overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setMode("scan")}
                            className={`flex-1 px-4 py-3 text-sm ${mode === "scan" ? "bg-gray-900 text-white" : "bg-white"
                                }`}
                        >
                            카메라 스캔
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("upload")}
                            className={`flex-1 px-4 py-3 text-sm border-l ${mode === "upload" ? "bg-gray-900 text-white" : "bg-white"
                                }`}
                        >
                            이미지 업로드
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("personal")}
                            className={`flex-1 px-4 py-3 text-sm border-l ${mode === "personal" ? "bg-gray-900 text-white" : "bg-white"
                                }`}
                        >
                            직접 입력
                        </button>
                    </div>

                    {/* 선택된 방식 */}
                    <div className="w-full mt-4">
                        {mode === "scan" ? (
                            <ReceiptBarcodeScanner onDetected={(text) => setCode(text)} />
                        ) : mode === "upload" ? (
                            <ReceiptBarcodeFromImage onDetected={(text) => setCode(text)} />
                        ) : null}
                    </div>
                </div>

                {/* 인식된 값 */}
                <div className="w-full flex flex-col gap-1">
                    <div className="px-2 text-start">인식된 값</div>
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
                    />
                </div>

                {/* 인증 버튼 */}
                <div className="fixed w-full max-w-xl bottom-0 left-1/2 -translate-x-1/2 p-4 bg-white border-t">
                    <CustomCommonButton onClick={handleSubmit}>인증</CustomCommonButton>
                </div>
            </div>
        </div>
    );
};

export default ReceiptCertificate;