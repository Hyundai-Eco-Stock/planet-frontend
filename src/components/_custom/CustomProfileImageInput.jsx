import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faXmark } from "@fortawesome/free-solid-svg-icons";

const CustomProfileImageInput = ({
    value,
    onChange,
    previewUrl,
    accept = "image/*",
    disabled = false,
    placeholderIcon = faCamera,
    className = "",
    showClear = true,      // X 버튼 표시 여부
}) => {
    const [localUrl, setLocalUrl] = useState(previewUrl);
    const objectUrlRef = useRef(null);                      // revoke용
    const [inputKey, setInputKey] = useState(0);            // input 초기화용

    useEffect(() => {
        // 외부에서 previewUrl 제공 시 우선
        if (previewUrl) {
            // 이전 URL revoke
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
            setLocalUrl(previewUrl);
            return;
        }

        // previewUrl이 없고, value(File)가 있으면 ObjectURL 생성
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            // 기존 URL revoke
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = url;
            setLocalUrl(url);
        } else {
            // value가 null이면 미리보기 제거
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
            setLocalUrl(undefined);
        }
    }, [value, previewUrl]);

    // 언마운트 시 revoke
    useEffect(() => {
        return () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        };
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        onChange?.(file); // localUrl은 위 useEffect에서 value 변화로 세팅됨
    };

    const handleClear = () => {
        onChange?.(null);
        setInputKey((k) => k + 1); // 파일 인풋 초기화
    };

    return (
        <div className={`flex gap-3 items-center ${className}`}>
            <label className="relative block">
                <input
                    key={inputKey}
                    type="file"
                    accept={accept}
                    disabled={disabled}
                    onChange={handleImageChange}
                    className="hidden"
                />
                <div
                    className="
                        w-[100px] h-[100px] rounded-full
                        flex items-center justify-center
                        border border-gray-300 bg-gray-50
                        shrink-0 cursor-pointer
                    "
                >
                    {localUrl ? (
                        <img
                            src={localUrl}
                            alt="preview"
                            className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={placeholderIcon}
                            className="text-gray-400 text-3xl"
                        />
                    )}
                </div>

                {showClear && localUrl && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="이미지 제거"
                        className="
                            absolute -right-0 -top-0 w-6 h-6
                            rounded-full bg-white border border-gray-300
                            flex items-center justify-center shadow-sm
                            hover:bg-gray-50
                        "
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                )}
            </label>
        </div>
    );
};

export default CustomProfileImageInput;