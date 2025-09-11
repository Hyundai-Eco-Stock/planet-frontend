import React from "react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

import useAuthStore from "@/store/authStore";

/**
 * @components 헤더에 사용하는 프로필 이미지
 * @returns 
 */
const ProfileButton = ({ size = "default" }) => {
    const name = useAuthStore((s) => s.name);
    const email = useAuthStore((s) => s.email);
    const profile = useAuthStore((s) => s.profile);

    // 크기별 클래스 정의
    const sizeClasses = {
        default: "w-20 h-20",
        large: "w-16 h-16",
        "extra-large": "w-32 h-32",
        small: "w-12 h-12"
    };

    const currentSize = sizeClasses[size] || sizeClasses.default;

    return (
        <>
            {profile ? (
                <img
                    src={profile}
                    alt={name ?? email ?? "profile"}
                    referrerPolicy="no-referrer"
                    className={`${currentSize} rounded-full object-cover`}
                />
            ) : (
                <FontAwesomeIcon
                    icon={faUserCircle}
                    style={{ color: "#ccc" }}
                    className={`${currentSize}`}
                />
            )}
        </>
    );
}

/**
 * @components 관리자용 프로필 이미지
 * @returns 
 */
const AdminProfileButton = () => {
    const name = useAuthStore((s) => s.name);
    const email = useAuthStore((s) => s.email);
    const profile = useAuthStore((s) => s.profile);

    return (
        <>
            {profile ? (
                <img
                    src={profile}
                    alt={name ?? email ?? "profile"}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover"
                />
            ) : (
                <FontAwesomeIcon
                    icon={faUserCircle}
                    style={{ color: "#ccc" }}
                    className="w-12 h-12"
                />
            )}
        </>
    );
}

export { ProfileButton, AdminProfileButton };