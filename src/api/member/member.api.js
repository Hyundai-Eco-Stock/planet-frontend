import apiClient from "@/api/_base/apiClient";

export const searchAllMembers = async () => {
	const response = await apiClient.get("/members");
	return response.data;
};

export const fetchMemberProfile = async () => {
	const response = await apiClient.get("/members/me");
	return response.data;
};

export const updateProfile = async ({
	email,
	name,
	profileImageFile,
	sex,
	birth,
	address,
	detailAddress,
	oldPassword,
}) => {
	const updateProfileData = { email, name, sex, birth, address, detailAddress, oldPassword};

	const multipartForm = new FormData();
	multipartForm.append(
		"updateProfile",
		new Blob([JSON.stringify(updateProfileData)], { type: "application/json" })
	);

	if (profileImageFile) {
		const filename = profileImageFile.name || "profile.jpg";
		multipartForm.append("profileImageFile", profileImageFile, filename);
	}

	const response = await apiClient.put("/members/me", multipartForm, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return response.data;
};


// 마이페이지 - 구매내역
export const fetchMyOrders = async () => {
	const response = await apiClient.get("members/me/orders");
	console.log("내 주문내역 조회:", response.data);
	return response.data;
};

// 마이페이지 - 예약한 에코딜 상품
export const fetchMyEcoDeals = async () => {
	const response = await apiClient.get("members/me/eco-deals");
	console.log("내 에코딜 조회:", response.data);
	return response.data;
};


// 마이페이지 - 래플 응모내역
export const fetchMyRaffles = async () => {
	const response = await apiClient.get("members/me/raffles");
	console.log("내 래플 응모내역 조회:", response.data);
	return response.data;
};
