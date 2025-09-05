import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    createCarEnterHistory,
    createCarExitHistory,
    fetchCarHistories,
} from "@/api_department_core_backend/car/carAccessHistory.api"; // 경로 맞게 수정하세요

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { SimpleSelect } from "@/components/_custom/CustomSelect";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

const CarAccessHistoryCreate = () => {
    const [carNumber, setCarNumber] = useState("");
    const [histories, setHistories] = useState([]);

    // 기록 불러오기
    const loadHistories = async () => {
        try {
            const data = await fetchCarHistories();
            setHistories(data);
        } catch (err) {
            console.error(err);
            Swal.fire("불러오기 실패", "입출차 기록을 불러올 수 없습니다.", "error");
        }
    };

    useEffect(() => {
        loadHistories();
    }, []);

    // 기록 생성
    const handleEnterCreate = async () => {
        if (!carNumber.trim()) {
            Swal.fire("입력 오류", "차량 번호를 입력해주세요.", "warning");
            return;
        }

        await createCarEnterHistory(carNumber)
            .then(() => {
                Swal.fire("성공", "입차 되었습니다.", "success");
                loadHistories();
            }).catch((err) => {
                Swal.fire(
                    "실패",
                    err.reseponse.data,
                    "error"
                );
            })
    };

    // 기록 생성
    const handleExitCreate = async () => {
        if (!carNumber.trim()) {
            Swal.fire("입력 오류", "차량 번호를 입력해주세요.", "warning");
            return;
        }

        await createCarExitHistory(carNumber)
            .then(() => {
                Swal.fire("성공", "출차 되었습니다.", "success");
                loadHistories();
            }).catch((err) => {
                Swal.fire(
                    "실패",
                    err.reseponse.data,
                    "error"
                );
            })
    };

    return (
        <div className="pt-8 m-auto max-w-screen-md space-y-6">
            <h2 className="text-xl font-bold">차량 입출차 기록 생성</h2>

            {/* 입력 영역 */}
            <div className="flex gap-2 items-center">
                <CustomCommonInput
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="차량 번호 (예: 12가3456)"
                />

                <CustomCommonButton
                    onClick={handleEnterCreate}
                    className="py-4 w-[15rem] !bg-blue-500"
                    children="입차"
                />
                <CustomCommonButton
                    onClick={handleExitCreate}
                    className="py-4 w-[15rem] !bg-red-500"
                    children="출차"
                />
            </div>

            {/* 최근 기록 목록 */}
            <div className="h-1">
                <h3 className="font-semibold mb-2">최근 입출차 기록</h3>
                <ul className="space-y-2">
                    {histories.length === 0 && (
                        <li className="text-gray-500">기록이 없습니다.</li>
                    )}
                    {histories.map((h) => (
                        <li
                            key={h.carAccessHistoryId}
                            className="border rounded-lg px-3 py-2 flex justify-between"
                        >
                            <span
                                onClick={() => setCarNumber(h.carNumber)}
                                className="cursor-pointer text-blue-600 hover:underline"
                                title="차량 번호를 입력창에 채우기"
                            >
                                {h.carNumber}
                            </span>
                            <span
                                className={
                                    h.status === "ENTER"
                                        ? "text-green-600 font-bold"
                                        : "text-red-600 font-bold"
                                }
                            >
                                {h.status === "ENTER" ? "입차" : "출차"}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {h.createdAt}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CarAccessHistoryCreate;