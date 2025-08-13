import React from "react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "@/store/authStore";

/**
 * @components 헤더에 사용하는 프로필 이미지
 * @returns 
 */
const ProfileButton = () => {

    const navigate = useNavigate();

    const name = useAuthStore((s) => s.name);
    const email = useAuthStore((s) => s.email);
    const profile = useAuthStore((s) => s.profile);

    const goToLogin = () => {
        navigate("/login");
    }

    return (
        <div>
            {profile ? (
                <img
                    src={profile}
                    alt={name ?? email ?? "profile"}
                    referrerPolicy="no-referrer"
                    style={{ width: "50px", borderRadius: '50%' }}
                />
            ) : (
                <button onClick={goToLogin}>
                    로그인이 필요합니다
                </button>
            )}
        </div>
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