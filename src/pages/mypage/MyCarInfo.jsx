import Swal from "sweetalert2";
import { useState, useEffect } from "react";

import { fetchMyCarInfo, registerCarInfo, unregisterCarInfo } from "@/api/car/car.api";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
// import { SimpleSelect } from "@/components/_custom/CustomSelect";
import { CustomCommonButton } from "../../components/_custom/CustomButtons";
import { useOutletContext } from "react-router-dom";
import { fetchCarHistoriesByCarNumber } from "@/api_department_core_backend/car/carAccessHistory.api";


const MyCarInfo = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("내 차량 관리");
    }, [setTitle]);

    const [carNumberLeft, setCarNumberLeft] = useState(null);
    const [carNumberMiddle, setCarNumberMiddle] = useState(null);
    const [carNumberRight, setCarNumberRight] = useState(null);
    const [carInfoExist, setCarInfoExist] = useState(null);
    const [carHistories, setCarHistories] = useState([]);

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

    useEffect(() => {
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
                    _fetchCarAccessHistories();
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

        const _fetchCarAccessHistories = () => {
            const carNumber = `${carNumberLeft}${carNumberMiddle}${carNumberRight}`;
            fetchCarHistoriesByCarNumber(carNumber)
                .then((data) => {
                    console.log(data);
                    setCarHistories(data);
                })
        }

        handleFetchCarInfo();
    }, [])

    return (
        <div className="space-y-4 pb-24">
            <div>
                <label className="block mb-1 font-semibold">내 차량 번호</label>
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
            {/* 입출차 기록 */}
            {
                carHistories.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-base font-semibold text-gray-700 mb-2">입/출차 기록</h3>
                        <div className="divide-y divide-gray-200 border rounded-lg bg-white shadow">
                            {carHistories.map((h) => (
                                <div
                                    key={h.carAccessHistoryId}
                                    className="px-4 py-3 flex items-center justify-between"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {new Date(h.createdAt).toLocaleString("ko-KR")}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {h.status === "ENTER" ? "입차" : h.status === "EXIT" ? "출차" : h.status}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold rounded-full
                                                ${h.status === "ENTER" ? "bg-emerald-100 text-emerald-700"
                                                : h.status === "EXIT" ? "bg-blue-100 text-blue-700"
                                                    : "bg-gray-100 text-gray-600"}`}
                                    >
                                        {h.status === "ENTER" ? "입차" : h.status === "EXIT" ? "출차" : h.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
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