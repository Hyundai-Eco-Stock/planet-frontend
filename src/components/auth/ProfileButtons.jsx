import React from "react";
import { useNavigate } from "react-router-dom";

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
        <img
            src={profile}
            alt={name ?? email ?? "profile"}
            referrerPolicy="no-referrer"
            style={{ width: "50px", borderRadius: '50%' }}
        />
    );
}
/**
 * @components 회원가입과 회원 수정에 사용할 프로필 이미지
 * 
 * @returns
 */
const Profile = () => {

}

export default ProfileButton;