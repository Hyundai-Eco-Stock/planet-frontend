import { useEffect, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
import CustomImageInput from "../_custom/CustomImageInput";

const ReceiptBarcodeFromImage = ({ onDetected }) => {
    const [file, setFile] = useState(null);    // ✅ 미리보기/디코딩용 File 상태

    useEffect(() => {
        if (!file) return;
        const url = URL.createObjectURL(file);

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
        const run = async () => {
            try {
                const res = await reader.decodeFromImageUrl(url);
                const text = res.getText();
                onDetected?.(text);
            } catch {
            } finally {
                URL.revokeObjectURL(url);
            }
        };

        run();
    }, [file, onDetected]);


    return (
        <CustomImageInput value={file} onChange={setFile} size={140} />
    );
};

export default ReceiptBarcodeFromImage;