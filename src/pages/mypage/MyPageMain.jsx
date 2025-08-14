import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import ProfileButton from "@/components/auth/ProfileButtons";
import { logout } from "@/api/auth/auth.api";

const MyPageMain = () => {
    const navigate = useNavigate();

    const name = useAuthStore((s) => s.name);
    const email = useAuthStore((s) => s.email);
    const profile = useAuthStore((s) => s.profile);

    const handleLogout = async () => {
        await logout();
        useAuthStore.getState().clearAuth();
        navigate("/my-page/main", { replace: true });
    };

    const goToLogin = () => {
        navigate("/login");
    };

    return (
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            {name && email && profile ? (
                <>
                    <ProfileButton />
                    <span className="font-semibold">{name} 님</span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-red-500 hover:underline"
                    >
                        로그아웃
                    </button>
                </>
            ) : (
                <button
                    onClick={goToLogin}
                    className="text-sm text-blue-500 hover:underline"
                >
                    로그인이 필요합니다
                </button>
            )}
        </div>
    );
}

export default MyPageMain;