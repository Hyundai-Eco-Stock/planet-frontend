import { create } from "zustand";
import { persist } from "zustand/middleware";

const useNotificationStore = create(
    persist(
        (set) => ({
            // 초기 상태
            pushEnabled: false,
            notification: { title: "", body: "" },

            // 액션
            setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
            setNotification: (notification) => set({ notification }),
            clearNotification: () => set({ notification: { title: "", body: "" } }),
        }),
        {
            name: "notification-storage", // localStorage에 저장될 때 사용될 키
            partialize: (state) => ({ pushEnabled: state.pushEnabled }), // pushEnabled 상태만 저장
        }
    )
);

export default useNotificationStore;