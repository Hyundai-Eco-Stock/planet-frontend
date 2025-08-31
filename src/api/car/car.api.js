import apiClient from "@/api/_base/apiClient";

export const registerCarInfo = async (request) => {
	const response = await apiClient.post('/members/me/cars', request);
	return response.data;
}

export const fetchMyCarInfo = async () => {
	const response = await apiClient.get('/members/me/cars');
	return response.data;
}

export const unregisterCarInfo = async () => {
	const response = await apiClient.delete('/members/me/cars');
	return response.data;
}
