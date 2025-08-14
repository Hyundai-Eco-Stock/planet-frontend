import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

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
const CustomCommonInput = ({
    type = "text",
    placeholder = "",
    value,
    onChange,
    className = "",
    readOnly = false
}) => {

    return (
        <div className="relative w-full border rounded-xl border-black/20 focus-within:border-emerald-500 transition-colors">
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-4 py-4 rounded-xl outline-none placeholder:text-black/40
                    ${className}`}
            />

            {value && !readOnly && (
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
};

export { CustomCommonInput };