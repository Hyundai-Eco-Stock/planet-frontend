import Swal from 'sweetalert2';

import { useEffect, useState } from "react";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { CustomCommonInput } from "@/components/_custom/CustomInputs";

// 바코드: 두 컴포넌트 중에서 선택 사용
import ReceiptBarcodeScanner from "@/components/barcode/ReceiptBarcodeScanner";
import ReceiptBarcodeFromImage from "@/components/barcode/ReceiptBarcodeFromImage";
import CustomImageInput from "@/components/_custom/CustomImageInput";
import { certificateTumbler } from "@/api/eco_stock_certificate/ecoStockCertificate.api";
import { useOutletContext } from 'react-router-dom';

const TumblerCertificate = () => {

    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("텀블러 사용 인증");
    }, [setTitle]);

    // 바코드
    const [code, setCode] = useState("");
    const [mode, setMode] = useState("scan"); // 'scan' | 'upload' | 'personal'


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
        certificateTumbler(code)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "인증 성공",
                    text: "텀블러 주식 1개 발급 성공",
                    showDenyButton: true,
                    confirmButtonText: "주식 차트 바로 가기",
                    denyButtonText: "홈으로 가기"
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
                    text: error.response.data.message,
                    confirmButtonText: "확인",
                });
            });
    };

    return (
        <div className="max-w-xl w-full pt-8 text-center">
            <div className="space-y-6">
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

                    {/* 선택된 방식 렌더 */}
                    <div className="w-full mt-4">
                        {mode === "scan" ? (
                            <>
                                <ReceiptBarcodeScanner onDetected={(text) => setCode(text)} />
                            </>
                        ) : mode === "upload" ? (
                            <>
                                <ReceiptBarcodeFromImage onDetected={(text) => setCode(text)} />
                            </>
                        ) : (
                            <>
                            </>
                        )}
                    </div>
                </div>

                <div className='w-full flex flex-col gap-1'>
                    <div className='px-2 text-start'>인식된 값</div>
                    <CustomCommonInput
                        value={code}
                        onChange={(vOrEvent) =>
                            setCode(
                                vOrEvent?.target?.value !== undefined ? vOrEvent.target.value : vOrEvent
                            )
                        }
                        placeholder="영수증 바코드 번호를 입력하세요"
                    />
                </div>

                <div className="fixed w-full max-w-xl bottom-0 left-1/2 -translate-x-1/2 p-4 bg-white border-t">
                    <CustomCommonButton onClick={handleSubmit} children="인증" />
                </div>
            </div>
        </div>
    );
};

export default TumblerCertificate;