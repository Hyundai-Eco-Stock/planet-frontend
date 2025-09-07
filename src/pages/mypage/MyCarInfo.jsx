import Swal from "sweetalert2";
import { useState, useEffect } from "react";

import { fetchMyCarInfo, registerCarInfo, unregisterCarInfo } from "@/api/car/car.api";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
// import { SimpleSelect } from "@/components/_custom/CustomSelect";
import { CustomCommonButton } from "../../components/_custom/CustomButtons";
import { useOutletContext } from "react-router-dom";


const MyCarInfo = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("내 차량 관리");
    }, [setTitle]);

    const [carNumberLeft, setCarNumberLeft] = useState(null);
    const [carNumberMiddle, setCarNumberMiddle] = useState(null);
    const [carNumberRight, setCarNumberRight] = useState(null);
    const [carInfoExist, setCarInfoExist] = useState(null);

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
        const request = { carNumber };

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

    const handleDeleteCarInfo = async () => {

        const deleteCarInfo = async () => {
            try {
                const response = await unregisterCarInfo();
                Swal.fire({
                    icon: "success",
                    title: "삭제 완료",
                    text: "차량 정보가 삭제되었습니다.",
                });
                setCarNumberLeft("");
                setCarNumberMiddle("");
                setCarNumberRight("");
                setCarInfoExist(false);
            } catch (err) {
                console.error(err);
                Swal.fire({
                    icon: "error",
                    title: "차량 정보 삭제 실패",
                    text: "잠시 후 다시 시도해주세요.",
                });
            }
        }

        Swal.fire({
            icon: "warning",
            title: "정말 삭제하시겠습니까?",
            text: "삭제 후에는 복구할 수 없습니다.",
            showCancelButton: true, // 취소 버튼 표시
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
            confirmButtonColor: "#d33", // 빨간색 (위험)
            cancelButtonColor: "#3085d6", // 파란색
        }).then((result) => {
            if (result.isConfirmed) { // 확인 눌렀을 때 삭제 실행
                deleteCarInfo();
            }
        });
    }

    useState(() => {
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
                    setCarInfoExist(true);
                } else {
                    setCarNumberLeft("");
                    setCarNumberMiddle("");
                    setCarNumberRight("");
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

        handleFetchCarInfo();
    }, [])

    return (
        <div className="space-y-4">
            <div>
                <label className="block mb-1 font-semibold">차량 번호</label>
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
            <div className="max-w-xl w-full fixed bottom-0 left-1/2 -translate-x-1/2 bg-white p-4 border-t">

                {!carInfoExist ?
                    <CustomCommonButton
                        onClick={handleRegisterCarInfo}
                    >
                        차량 정보 등록
                    </CustomCommonButton>
                    :
                    <CustomCommonButton
                        onClick={handleDeleteCarInfo}
                        className="bg-red-500"
                    >
                        차량 정보 삭제
                    </CustomCommonButton>
                }
            </div>
        </div>
    );
}

export default MyCarInfo;