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
            className={`
                    w-full py-3 rounded-xl 
                    text-white text-lg font-semibold
                    bg-emerald-500 hover:bg-emerald-600
                    active:translate-y-[1px] transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${className}`}
        >
            {children}
        </button>
    );
};



export { CustomCommonButton };