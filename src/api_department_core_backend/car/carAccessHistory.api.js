import apiClient from "@/api_department_core_backend/_base/apiClient";

export const createCarEnterHistory = async (carNumber) => {
	const response = await apiClient.post('/cars/access/enter', { carNumber });
	return response.data;
}

export const createCarExitHistory = async (carNumber) => {
	const response = await apiClient.post('/cars/access/exit', { carNumber });
	return response.data;
}

export const fetchCarHistories = async () => {
	const response = await apiClient.get('/cars/access');
	return response.data;
}