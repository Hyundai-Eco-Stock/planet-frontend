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
                    text: '앱의 알림 권한을 허용해주세요',
                    confirmButtonText: '확인',
                })
                return;
            }
            requestPermission();
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <main className="px-4 py-8 pb-24">
                {/* 안내 메시지 */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 text-center border border-purple-100 mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">앱 설정</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        알림 설정을 관리하고 <br />
                        앱 사용 환경을 개선할 수 있습니다
                    </p>
                </div>

                {/* 푸시 알림 설정 */}
                <div className="mb-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">알림 설정</h2>
                        <p className="text-sm text-gray-600">푸시 알림 수신 여부를 설정할 수 있습니다</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    pushEnabled 
                                        ? "bg-gradient-to-r from-green-100 to-emerald-100" 
                                        : "bg-gradient-to-r from-gray-100 to-slate-100"
                                }`}>
                                    <svg className={`w-6 h-6 ${pushEnabled ? "text-green-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                
                                <div>
                                    <div className="text-base font-semibold text-gray-900">
                                        푸시 알림
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {pushEnabled ? "알림을 받고 있습니다" : "알림이 꺼져 있습니다"}
                                    </div>
                                </div>
                            </div>
                            
                            {/* 기존 토글 스위치 그대로 유지 */}
                            <button
                                onClick={handleToggle}
                                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${
                                    pushEnabled ? "bg-green-500" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                        pushEnabled ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                        
                        {/* 상태 설명 */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                {pushEnabled 
                                    ? "새로운 소식, 포인트 적립, 래플 당첨 등의 알림을 받을 수 있습니다." 
                                    : "알림을 켜면 중요한 업데이트를 놓치지 않고 받아볼 수 있습니다."
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* 추가 설정 영역 */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 text-center border border-blue-100">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">추가 설정</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        더 많은 설정 옵션이 곧 추가될 예정입니다
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Settings;