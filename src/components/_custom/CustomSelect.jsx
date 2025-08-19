import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const CustomSelect = ({
    value,
    onChange,
    options = [],
    placeholder = "선택하세요",
    optgroups = [],
    className = "",
}) => {
    return (
        <div className={`relative w-full border rounded-xl border-black/20 focus-within:border-emerald-500 transition-colors ${className}`}>
            <select
                className="w-full px-4 py-4 pr-10 rounded-xl outline-none appearance-none bg-white placeholder:text-black/40"
                value={value}
                onChange={onChange}
            >
                <option value="">{placeholder}</option>

                {/* optgroup 기반 렌더링 */}
                {optgroups.length > 0 &&
                    optgroups.map((group) => (
                        <optgroup key={group.id} label={group.label}>
                            {group.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </optgroup>
                    ))}

                {/* 일반 옵션 */}
                {options.length > 0 &&
                    options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
            </select>

            {/* ▼ 아이콘을 FontAwesome faChevronDown으로 교체 */}
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                <FontAwesomeIcon icon={faChevronDown} />
            </div>
        </div>
    );
};

export { CustomSelect };