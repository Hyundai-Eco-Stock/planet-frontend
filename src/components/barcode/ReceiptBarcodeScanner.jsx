import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

const ReceiptBarcodeScanner = ({ onDetected }) => {
    const videoRef = useRef(null);
    const controlsRef = useRef(null);
    const streamRef = useRef(null);

    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const start = async () => {
            if (!videoRef.current) return;

            // ZXing 설정
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
                // 카메라 직접 오픈 (명시적으로 streamRef에 저장)
                streamRef.current = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false,
                });
                videoRef.current.srcObject = streamRef.current;

                // ZXing에 우리가 연 스트림을 넘김
                controlsRef.current = await reader.decodeFromStream(
                    streamRef.current,
                    videoRef.current,
                    (result, err) => {
                        if (result) {
                            onDetected(result.getText(), result);

                            // 스캔 성공 → 정리
                            reader.reset();
                            stopStream();
                            setRunning(false);
                        }
                    }
                );
            } catch (e) {
                setError(e?.message || "카메라 초기화 실패");
                setRunning(false);
            }
        };

        const stopStream = () => {
            controlsRef.current?.stop?.();
            controlsRef.current = null;

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        start();

        return () => {
            stopStream();
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
                autoPlay
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