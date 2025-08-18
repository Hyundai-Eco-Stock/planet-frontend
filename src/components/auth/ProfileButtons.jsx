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
                    style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
            ) : (
                <FontAwesomeIcon
                    icon={faUserCircle}
                    style={{ fontSize: "50px", color: "#ccc" }}
                />
            )}
        </>
    );
}


export default ProfileButton;