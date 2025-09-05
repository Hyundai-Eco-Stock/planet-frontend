import { forwardRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

/**
 * 
 * @param type
 * @param placeholder
 * @param value
 * @param onChange
 * @param className
 * @param readOnly
 * @returns 
 */
const CustomCommonInput = forwardRef(
    (
        {
            type = "text",
            placeholder = "",
            value = "",
            onChange,
            className = "",
            readOnly = false,
            autoFocus = false,
            closeBtnVisible = true,
            maxLength,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);

        const isPassword = type === "password";
        
        const inputType = isPassword
            ? showPassword
                ? "text"
                : "password"
            : type === "number"
                ? "text"
                : type;

        const handleChange = (e) => {
            let newValue = e.target.value;

            // 숫자 타입이면 숫자만 허용 + 길이 제한
            if (type === "number") {
                newValue = newValue.replace(/\D/g, ""); // 숫자만 남기기
                if (maxLength) {
                    newValue = newValue.slice(0, maxLength);
                }
            }

            onChange?.({ target: { value: newValue } });
        };

        return (
            <div className="relative w-full border rounded-xl border-black/20 focus-within:border-emerald-500 transition-colors">
                <input
                    ref={ref}
                    type={inputType}
                    inputMode={type === "number" ? "numeric" : undefined}
                    placeholder={placeholder}
                    value={value ?? ""}
                    onChange={handleChange}
                    readOnly={readOnly}
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    className={`w-full px-4 py-4 rounded-xl outline-none placeholder:text-black/40
                        ${readOnly ? "bg-emerald-500 text-white cursor-not-allowed" : "bg-white"}
                        ${className}`}
                    {...props}
                />

                {/* 비밀번호 눈 아이콘 */}
                {isPassword && value && !readOnly && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-10 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                    </button>
                )}

                {/* X 버튼 */}
                {value && closeBtnVisible && !readOnly && (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: "" } })}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>
        );
    }
);


/**
 * 카드 번호 input 받기
 * @param {*} param0 
 * @returns 
 */
const CardNumberInput = ({
    value = "",
    onChange
}) => {
    const parts = [
        value.slice(0, 4),
        value.slice(4, 8),
        value.slice(8, 12),
        value.slice(12, 16),
    ];

    const inputsRef = useRef([]);

    const handleChange = (idx, e) => {
        const newValue = e.target.value.replace(/\D/g, "").slice(0, 4);
        const newParts = [...parts];
        newParts[idx] = newValue;

        const joined = newParts.join("");
        onChange?.(joined);

        if (newValue.length === 4 && idx < 3) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === "Backspace" && parts[idx].length === 0 && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    return (
        <div className="flex items-center w-full">
            {/* {parts.map((part, idx) => (
                <div key={idx} className="flex items-center">
                    <CardNumberInputField
                        idx={idx}
                        value={part}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        inputRef={(el) => (inputsRef.current[idx] = el)}
                    />
                    {idx < parts.length - 1 && (
                        <span className="mx-2 text-gray-500 text-lg">-</span>
                    )}
                </div>
            ))} */}
            <CardNumberInputField
                idx={0}
                value={parts[0]}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                inputRef={(el) => (inputsRef.current[0] = el)}
            />
            <span className="mx-2 text-gray-500 text-lg">-</span>
            <CardNumberInputField
                idx={1}
                value={parts[1]}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                inputRef={(el) => (inputsRef.current[1] = el)}
            />
            <span className="mx-2 text-gray-500 text-lg">-</span>
            <CardNumberInputField
                idx={2}
                value={parts[2]}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                inputRef={(el) => (inputsRef.current[2] = el)}
            />
            <span className="mx-2 text-gray-500 text-lg">-</span>
            <CardNumberInputField
                idx={3}
                value={parts[3]}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                inputRef={(el) => (inputsRef.current[3] = el)}
            />
        </div>
    );
};


/**
 * 카드번호 input 단일 필드
 */
const CardNumberInputField = ({ idx, value, onChange, onKeyDown, inputRef }) => {
    return (
        <div className="relative flex-1 border rounded-xl border-black/20 focus-within:border-emerald-500 transition-colors">
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                className="w-full py-4 rounded-xl outline-none text-center placeholder:text-black/40"
                value={value}
                onChange={(e) => onChange(idx, e)}
                onKeyDown={(e) => onKeyDown(idx, e)}
            />
        </div>
    );
};


export { CustomCommonInput, CardNumberInput };