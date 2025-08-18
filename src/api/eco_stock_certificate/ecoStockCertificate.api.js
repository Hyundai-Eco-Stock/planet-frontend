import apiClient from "@/api/_base/apiClient";


export const certificateTumbler = async (code) => {
	const response = await apiClient.post("/certificate/tumbler", {
		code,
	});
	return response.data;
};