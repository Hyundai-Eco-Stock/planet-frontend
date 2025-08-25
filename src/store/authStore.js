import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
	persist(
		(set) => ({
			loginStatus: null,
			accessToken: null,
			email: null,
			name: null,
			profile: null,

			setLoginStatus: (loginStatus) => set({ loginStatus }),

			setAccessToken: (accessToken) => set({ accessToken }),

			setEmail: (email) => set({ email }),

			setName: (name) => set({ name }),

			setProfile: (profile) => set({ profile }),

			clearAuth: () => set({ loginStatus: null, accessToken: null, email: null, name: null, profile: null, }),
		}),
		{
			name: "template-auth-storage",
			partialize: (state) => ({
				loginStatus: state.loginStatus,
				accessToken: state.accessToken,
				email: state.email,
				name: state.name,
				profile: state.profile,
			}),
		}
	)
);

export default useAuthStore;