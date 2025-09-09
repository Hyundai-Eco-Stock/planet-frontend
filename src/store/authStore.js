import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
	persist(
		(set) => ({
			loginStatus: null,
			signUpStatus: null,
			accessToken: null,
			email: null,
			name: null,
			profile: null,
			role: null,

			setLoginStatus: (loginStatus) => set({ loginStatus }),

			setSignUpStatus: (signUpStatus) => set({ signUpStatus }),

			setAccessToken: (accessToken) => set({ accessToken }),

			setEmail: (email) => set({ email }),

			setName: (name) => set({ name }),

			setProfile: (profile) => set({ profile }),

			setRole: (role) => set({ role }),

			clearAuth: () => set({ loginStatus: null, signUpStatus: null, accessToken: null, email: null, name: null, profile: null, role: null }),
		}),
		{
			name: "template-auth-storage",
			partialize: (state) => ({
				loginStatus: state.loginStatus,
				signUpStatus: state.signUpStatus,
				accessToken: state.accessToken,
				email: state.email,
				name: state.name,
				profile: state.profile,
				role: state.role,
			}),
		}
	)
);

export default useAuthStore;