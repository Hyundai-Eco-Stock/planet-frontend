// src/components/CustomCommonButton.jsx

/**
 * 
 * @param children
 * @param onClick
 * @param className
 * @param type
 * @param disabled
 * @returns 
 */
const CustomCommonButton = ({
    children,
    onClick,
    className = "",
    type = "button",
    disabled = false
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-medium text-white
                        bg-blue-500 hover:bg-blue-600 
                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition duration-200
                        ${className}`}
        >
            {children}
        </button>
    );
};



export { CustomCommonButton };