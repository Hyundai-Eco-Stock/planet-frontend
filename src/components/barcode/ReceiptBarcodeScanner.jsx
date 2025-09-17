import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

const ReceiptBarcodeScanner = ({ running, onDetected }) => {
    const videoRef = useRef(null);
    const controlsRef = useRef(null);
    const streamRef = useRef(null);
    const detectedRef = useRef(false);

    // 스트림 정리
    const stopStream = () => {
        try {
            controlsRef.current?.stop?.();
        } catch { }
        controlsRef.current = null;

        try {
            streamRef.current?.getTracks().forEach((t) => t.stop());
        } catch { }
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        if (!running) {
            stopStream();
            return;
        }

        const start = async () => {
            if (!videoRef.current) return;

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
            detectedRef.current = false;

            try {
                streamRef.current = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: "environment" },
                        width: { min: 640, ideal: 1280 },
                        height: { min: 480, ideal: 720 },
                    },
                    audio: false,
                });

                videoRef.current.srcObject = streamRef.current;

                controlsRef.current = await reader.decodeFromStream(
                    streamRef.current,
                    videoRef.current,
                    (result) => {
                        if (result && !detectedRef.current) {
                            detectedRef.current = true;
                            // 부모 콜백에만 전달
                            onDetected(result.getText(), result);
                            // 자동 종료
                            stopStream();
                            reader.reset();
                        }
                    }
                );
            } catch (e) {
                console.error("카메라 초기화 실패:", e);
                stopStream();
            }
        };

        start();

        return () => stopStream();
    }, [running, onDetected]);

    return (
        <video
            ref={videoRef}
            className="w-full h-full rounded-lg border"
            muted
            playsInline
            autoPlay
        />
    );
};

ReceiptBarcodeScanner.propTypes = {
    running: PropTypes.bool.isRequired,   // 부모가 실행 여부 제어
    onDetected: PropTypes.func.isRequired,
};

export default ReceiptBarcodeScanner;