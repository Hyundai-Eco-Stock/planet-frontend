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
    const borderClass = value
        ? "input-border-active"
        : "input-border-default";

    return (
        <div className="relative w-full">
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-4 py-2 pr-10 rounded-lg border 
                    focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-blue-500 
                    transition duration-200 
                    placeholder-gray-400 text-gray-900
                    dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-500
                    ${borderClass} ${className}`}
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