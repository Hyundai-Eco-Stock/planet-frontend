import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
	persist(
		(set) => ({
			accessToken: null,
			email: null,
			name: null,
			profile: null,

			setAccessToken: (accessToken) => set({ accessToken }),
			clearAccessToken: () => set({ accessToken: null }),

			setEmail: (email) => set({ email }),
			clearEmail: () => set({ email: null }),

			setName: (name) => set({ name }),
			clearName: () => set({ name: null }),

			setProfile: (profile) => set({ profile }),
			clearProfile: () => set({ profile: null }),

			clearAuth: () => set({ accessToken: null, email: null, name: null, profile: null, }),
		}),
		{
			name: "template-auth-storage",
			partialize: (state) => ({
				accessToken: state.accessToken,
				email: state.email,
				name: state.name,
				profile: state.profile,
			}),
		}
	)
);

export default useAuthStore;