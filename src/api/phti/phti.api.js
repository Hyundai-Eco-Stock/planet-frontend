import apiClient from "@/api/_base/apiClient";

export const fetchPhtiQuestinosAndChoices = async () => {
	const response = await apiClient.get('/phti/questions-with-choices');
	return response.data;
}
