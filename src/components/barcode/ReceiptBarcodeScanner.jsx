import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

const ReceiptBarcodeScanner = ({ onDetected }) => {
    const videoRef = useRef(null);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let controls;

        const start = async () => {
            if (!videoRef.current) return;

            // 읽을 포맷(영수증은 Code128 비율 높음, EAN/UPC도 함께)
            const hints = new Map();
            hints.set(DecodeHintType.POSSIBLE_FORMATS, [
                BarcodeFormat.CODE_128,
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
                BarcodeFormat.CODE_39,
            ]);

            const reader = new BrowserMultiFormatReader(hints);
            setRunning(true);

            try {
                controls = await reader.decodeFromVideoDevice(
                    undefined, // 기본 카메라
                    videoRef.current,
                    (result, err, c) => {
                        if (result) {
                            onDetected(result.getText(), result);
                            c.stop(); // 한 번 읽으면 멈춤
                            setRunning(false);
                        }
                        // err는 스캔 진행 중 빈번 (NotFound 등) → 무시
                    }
                );
            } catch (e) {
                setError(e?.message || "카메라 초기화 실패");
                setRunning(false);
            }
        };

        start();

        return () => {
            controls?.stop?.();
            setRunning(false);
        };
    }, [onDetected]);

    return (
        <div className="w-full h-full space-y-2">
            <video
                ref={videoRef}
                className="w-full h-full rounded-lg border"
                muted
                playsInline
            />
            <div className="text-xs text-gray-500">
                {running ? "스캔 중…" : error ? `오류: ${error}` : "스캔 준비 완료"}
            </div>
        </div>
    );
};

ReceiptBarcodeScanner.propTypes = {
    onDetected: PropTypes.func.isRequired,
};

export default ReceiptBarcodeScanner;