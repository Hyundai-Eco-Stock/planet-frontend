import apiClient from "@/api/_base/apiClient";

/**
 * 영수증 발행 이벤트 생성
 * @param {*} memberId 
//  * @param {*} totalAmount 
//  * @param {*} itemCount 
 * @param {*} bagKeywordFound 
 * @returns 
 */
export const createPaperBagNoUseReceipt = async (
	// eventId, 
	memberId, 
	// totalAmount, 
	// itemCount, 
	bagKeywordFound) => {
	const response = await apiClient.post("/receipts/paper-bag-no-use", {
		memberId,
		// totalAmount,
		// itemCount,
		bagKeywordFound
	});
	return response.data;
};