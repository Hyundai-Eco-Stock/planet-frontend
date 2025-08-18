import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

const CustomProfileImageInput = ({
    value,
    onChange,
    previewUrl,
    accept = "image/*",
    disabled = false,
    placeholderIcon = faCamera,
    className = "",
}) => {
    const [localUrl, setLocalUrl] = useState(previewUrl);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setLocalUrl(undefined);
            onChange?.(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setLocalUrl(url);
        onChange?.(file);
    };

    return (
        <div className={`flex gap-3 items-center ${className}`}>
            <label>
                <input
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
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={placeholderIcon}
                            className="text-gray-400 text-3xl"
                        />
                    )}
                </div>
            </label>
        </div>
    );
};

export default CustomProfileImageInput;