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
}) => {
	const updateProfileData = { email, name, sex, birth, address, detailAddress, };

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