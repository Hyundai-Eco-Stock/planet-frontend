import apiClient from "@/api/_base/apiClient";

// 내 카드 정보 조회
export const fetchMyCardInfo = async () => {
	const response = await apiClient.get("/members/me/cards");
	return response.data;
};

// 내 카드 정보 등록
export const registerMyCardInfo = async ({ cardCompanyId, cardNumber }) => {
	const response = await apiClient.post("/members/me/cards", { cardCompanyId, cardNumber });
	return response.data;
};

// 내 카드 정보 삭제
export const deleteMyCardInfo = async (memberCardId) => {
	const response = await apiClient.delete(`/members/me/cards/${memberCardId}`);
	return response.data;
};