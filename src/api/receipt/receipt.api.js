import apiClient from "@/api/_base/apiClient";

/**
 * 영수증 발행 이벤트 생성
 * @param {*} eventId 
 * @param {*} memberId 
 * @param {*} totalAmount 
 * @param {*} itemCount 
 * @param {*} bagKeywordFound 
 * @returns 
 */
export const createReceipt = async (eventId, memberId, totalAmount, itemCount, bagKeywordFound) => {
	const response = await apiClient.post("/receipts/paper-bag-no-use", {
		eventId,
		memberId,
		totalAmount,
		itemCount,
		bagKeywordFound
	});
	return response.data;
};