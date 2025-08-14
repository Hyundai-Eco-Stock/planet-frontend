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
            className={`w-full py-4 rounded-xl 
                    bg-emerald-500 hover:bg-emerald-600
                    text-white text-xl 
                    font-extrabold  
                    active:translate-y-[1px] transition
                    ${className}`}
        >
            {children}
        </button>
    );
};



export { CustomCommonButton };