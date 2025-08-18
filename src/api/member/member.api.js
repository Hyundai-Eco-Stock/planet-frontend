import apiClient from "@/api/_base/apiClient";

export const searchAllMembers = async () => {
	const response = await apiClient.get("/members");
	return response.data;
};