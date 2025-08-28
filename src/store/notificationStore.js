import { create } from "zustand";

const useNotificationStore = create((set) => ({
    // 초기 상태
    pushEnabled: false,
    notification: { title: "", body: "" },

    // 액션
    setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
    setNotification: (notification) => set({ notification }),
    clearNotification: () => set({ notification: { title: "", body: "" } }),
}));

export default useNotificationStore;