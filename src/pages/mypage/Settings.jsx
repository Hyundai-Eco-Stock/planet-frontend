import { useNotifications } from "@/hooks/fcm_notification/useNotifications";
import useNotificationStore from "@/store/notificationStore";
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";

const Settings = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("앱 설정");
    }, [setTitle]);

    const { requestPermission, revokePushToken } = useNotifications();
    const { pushEnabled } = useNotificationStore();

    const handleToggle = async () => {
        if (pushEnabled) {
            await revokePushToken();
        } else {
            if (Notification.permission !== 'granted') {
                await Notification.requestPermission()
                    .then((permission) => {
                        // "granted" | "denied" | "default"
                        console.log(permission);
                    });
            } 
            
            if (Notification.permission === "denied" || Notification.permission === "default") {
                Swal.fire({
                    icon: 'error',
                    title: '알림 권한 설정',
                    text: '브라우저의 알림 권한을 허용해주세요',
                    confirmButtonText: '확인',
                })
                return;
            }
            requestPermission();

            
        }
    };

    return (
        <div className="flex items-center gap-4 p-4">
            <span className="text-sm font-semibold text-gray-900">푸시 알림</span>

            <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${pushEnabled ? "bg-green-500" : "bg-gray-300"
                    }`}
            >
                <span
                    className={`
                        inline-block h-5 w-5 transform rounded-full 
                        bg-white shadow-md transition-transform duration-300
                        ${pushEnabled ? "translate-x-6" : "translate-x-1"}
                    `}
                />
            </button>

            <span className="text-sm text-gray-600">
                {pushEnabled ? "ON" : "OFF"}
            </span>
        </div>
    );
};

export default Settings;