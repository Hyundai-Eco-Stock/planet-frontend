import apiClient from "@/api/_base/apiClient";


export const certificateTumbler = async (code) => {
	const response = await apiClient.post("/certificate/tumbler", {
		code,
	});
	return response.data;
};

export const certificatePaperBagNoUse = async (code) => {
	const response = await apiClient.post("/certificate/paper-bag-no-use", {
		code,
	});
	return response.data;
};
