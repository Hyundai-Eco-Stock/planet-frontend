import { useNotifications } from '@/hooks/useNotifications';
import { useEffect, useState } from 'react';


const Settings = () => {
    const { isTokenExist, requestPermission, revokePushToken } = useNotifications();
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const exists = await isTokenExist();
            setIsEnabled(exists);
        };
        checkToken();
    }, []);

    const handleToggle = async () => {
        if (isEnabled) {
            // 현재 알림 ON → OFF로 전환
            await revokePushToken();
            setIsEnabled(false);
        } else {
            // 현재 알림 OFF → ON으로 전환
            await requestPermission();
            setIsEnabled(true);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4">
            <span className="text-gray-800 font-medium">푸시 알림</span>

            <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${isEnabled ? "bg-green-500" : "bg-gray-300"
                    }`}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>

            <span className="text-sm text-gray-600">
                {isEnabled ? "ON" : "OFF"}
            </span>
        </div>
    );
}

export default Settings;