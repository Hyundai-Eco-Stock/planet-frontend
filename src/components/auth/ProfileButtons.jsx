import React from "react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

import useAuthStore from "@/store/authStore";



/**
 * @components 헤더에 사용하는 프로필 이미지
 * @returns 
 */
const ProfileButton = () => {

    const size = '80px';

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
                    className={`w-[${size}] h-[${size}] rounded-full object-cover`}
                />
            ) : (
                <FontAwesomeIcon
                    icon={faUserCircle}
                    style={{ color: "#ccc" }}
                    className={`w-[${size}] h-[${size}]`}
                />
            )}
        </>
    );
}

/**
 * @components 헤더에 사용하는 프로필 이미지
 * @returns 
 */
const AdminProfileButton = () => {

    const size = '50px';

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
                    className={`w-[${size}] h-[${size}] rounded-full object-cover`}
                />
            ) : (
                <FontAwesomeIcon
                    icon={faUserCircle}
                    style={{ color: "#ccc" }}
                    className={`w-[${size}] h-[${size}]`}
                />
            )}
        </>
    );
}


export { ProfileButton, AdminProfileButton };