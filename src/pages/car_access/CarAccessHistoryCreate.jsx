import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    createCarEnterHistory,
    createCarExitHistory,
    fetchCarHistories,
} from "@/api/car/carAccessHistory.api"; // 경로 맞게 수정하세요

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { SimpleSelect } from "@/components/_custom/CustomSelect";

const CarAccessHistoryCreate = () => {
    const [carNumber, setCarNumber] = useState("");
    const [accessType, setAccessType] = useState(""); // ENTER / EXIT
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
    const handleCreate = async () => {
        if (!carNumber.trim()) {
            Swal.fire("입력 오류", "차량 번호를 입력해주세요.", "warning");
            return;
        }
        if (!accessType) {
            Swal.fire("입력 오류", "입차/출차 여부를 선택해주세요.", "warning");
            return;
        }

        try {
            if (accessType === "ENTER") {
                await createCarEnterHistory(carNumber);
            } else {
                await createCarExitHistory(carNumber);
            }

            Swal.fire("성공", "입출차 기록이 생성되었습니다.", "success");
            // setCarNumber("");
            // setAccessType("");
            loadHistories(); // 새로고침
        } catch (err) {
            // console.error(err);
            Swal.fire("실패", "기록 생성 중 오류가 발생했습니다.", "error");
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">차량 입출차 기록 생성</h2>

            {/* 입력 영역 */}
            <div className="flex gap-2 items-center">
                <CustomCommonInput
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="차량 번호 (예: 12가3456)"
                />

                <SimpleSelect
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value)}
                    options={[
                        { value: "ENTER", label: "입차" },
                        { value: "EXIT", label: "출차" },
                    ]}
                    placeholder="입출차 선택"
                />

                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
                >
                    기록 생성
                </button>
            </div>

            {/* 최근 기록 목록 */}
            <div>
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
                            <span>{h.carNumber}</span>
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