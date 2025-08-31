import { useState } from "react";

const DaumPostcode = ({ onComplete }) => {
    const openDaumPostcode = () => {
        new window.daum.Postcode({
            oncomplete: (data) => {
                // 기본 주소
                let fullAddr = data.address;
                let extraAddr = "";

                // 법정동, 건물명 등 추가정보
                if (data.addressType === "R") {
                    if (data.bname !== "") {
                        extraAddr += data.bname;
                    }
                    if (data.buildingName !== "") {
                        extraAddr += (extraAddr !== "" ? `, ${data.buildingName}` : data.buildingName);
                    }
                    fullAddr += extraAddr !== "" ? ` (${extraAddr})` : "";
                }

                onComplete({
                    zonecode: data.zonecode, // 우편번호
                    address: fullAddr,       // 도로명 주소
                });
            },
        }).open();
    };

    return (
        <button
            type="button"
            onClick={openDaumPostcode}
            className="w-[10rem] px-3 py-2 bg-emerald-500 text-white rounded-lg"
        >
            주소 검색
        </button>
    );
};

export default DaumPostcode;