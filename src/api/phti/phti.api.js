import apiClient from "@/api/_base/apiClient";

export const fetchAllPhtiList = async () => {
	const response = await apiClient.get('/phti');
	return response.data;
}

export const fetchPhtiQuestinosAndChoices = async () => {
	const response = await apiClient.get('/phti/questions-with-choices');
	return response.data;
}

export const submitPhtiSurvey = async (payload) => {
	const response = await apiClient.post('/phti/surveys', payload);
	return response.data;
}