import Swal from "sweetalert2";
import { useState, useEffect } from "react";

import { fetchMyCarInfo, registerCarInfo } from "@/api/car/car.api";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { SimpleSelect } from "@/components/_custom/CustomSelect";
import { CustomCommonButton } from "../../components/_custom/CustomButtons";


const MyCarInfo = () => {
    const [carNumberLeft, setCarNumberLeft] = useState(null);
    const [carNumberMiddle, setCarNumberMiddle] = useState(null);
    const [carNumberRight, setCarNumberRight] = useState(null);
    const [carEcoType, setCarEcoType] = useState(null);
    const [carInfoExist, setCarInfoExist] = useState(null);

    // 내 차 정보 가져오기
    const handleFetchCarInfo = async () => {
        try {
            const data = await fetchMyCarInfo();
            console.log(data);
            if (data) {
                // data.carNumber 예: "12가3456"
                const regex = /^(\d{2,3})([가-힣]{1})(\d{4})$/;
                const match = data.carNumber.match(regex);

                if (match) {
                    setCarNumberLeft(match[1]);
                    setCarNumberMiddle(match[2]);
                    setCarNumberRight(match[3]);
                }

                setCarEcoType(data.carEcoType || "NORMAL");
                setCarInfoExist(true);
            } else {
                setCarNumberLeft("");
                setCarNumberMiddle("");
                setCarNumberRight("");
                setCarEcoType("NORMAL");
                setCarInfoExist(false);
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "차량 정보 조회 실패",
                text: "잠시 후 다시 시도해주세요.",
            });
        }
    };

    // 내 차 정보 등록
    const handleRegisterCarInfo = async () => {
        if (!carNumberLeft || !carNumberMiddle || !carNumberRight) {
            Swal.fire({
                icon: "warning",
                title: "입력 오류",
                text: "차량 번호를 모두 입력해주세요.",
            });
            return;
        }

        const carNumber = `${carNumberLeft}${carNumberMiddle}${carNumberRight}`;
        const request = { carNumber, carEcoType };

        try {
            const response = await registerCarInfo(request);
            Swal.fire({
                icon: "success",
                title: "등록 완료",
                text: "차량 정보가 등록되었습니다.",
            });
            setCarInfoExist(true);
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "등록 실패",
                text: "잠시 후 다시 시도해주세요.",
            });
        }
    };

    // TODO
    const handleDeleteCarInfo = () => {

    }

    useState(() => {
        handleFetchCarInfo();
    }, [])

    return (
        <div className="space-y-4">
            <div>
                <label className="block mb-1 font-semibold">차 번호</label>
                <div className="flex gap-2">
                    <CustomCommonInput
                        value={carNumberLeft}
                        readOnly={carInfoExist}
                        maxLength={3}
                        onChange={(e) => setCarNumberLeft(e.target.value)}
                        placeholder="12"
                    />
                    <CustomCommonInput
                        value={carNumberMiddle}
                        readOnly={carInfoExist}
                        maxLength={1}
                        onChange={(e) => setCarNumberMiddle(e.target.value)}
                        placeholder="가"
                    />
                    <CustomCommonInput
                        value={carNumberRight}
                        readOnly={carInfoExist}
                        maxLength={4}
                        onChange={(e) => setCarNumberRight(e.target.value)}
                        placeholder="1234"
                    />
                </div>
            </div>

            <div>
                <label className="block mb-1 font-semibold">차 종류</label>
                <SimpleSelect
                    value={carEcoType}
                    onChange={(e) => setCarEcoType(e.target.value)}
                    options={[
                        { value: "NORMAL", label: "일반" },
                        { value: "ELECTRONIC", label: "전기차" },
                        { value: "HYBRID", label: "하이브리드" },
                    ]}
                    placeholder="선택하세요"
                />
            </div>

                <CustomCommonButton
                    onClick={handleRegisterCarInfo}
                    disabled={carInfoExist}
                >
                    차량 정보 등록
                </CustomCommonButton>

                <CustomCommonButton
                    onClick={handleDeleteCarInfo}
                    disabled={!carInfoExist}
                >
                    차량 정보 삭제 (개발 전)
                </CustomCommonButton>
        </div>
    );
}

export default MyCarInfo;