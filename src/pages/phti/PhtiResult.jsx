import { fetchAllPhtiList } from "@/api/phti/phti.api";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PhtiResult = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const data = state?.result;

    const [phtiList, setPhtiList] = useState([]);

    useEffect(() => {
        fetchAllPhtiList()
            .then((list) => {
                console.log(list);
                const sorted = [...list].sort((a, b) => {
                    if (a.phtiName === data.primaryPhti) return -1;
                    if (b.phtiName === data.primaryPhti) return 1;
                    if (a.phtiName === data.secondaryPhti) return -1;
                    if (b.phtiName === data.secondaryPhti) return 1;
                    if (a.phtiName === data.tertiaryPhti) return -1;
                    if (b.phtiName === data.tertiaryPhti) return 1;
                    return 0;
                });
                setPhtiList(sorted);
            })
    }, []);

    if (!data) {
        return <div>잘못된 접근입니다. 설문을 먼저 진행해주세요.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            {/* 사용자 결과 */}
            <div>
                <h1 className="text-2xl font-bold text-emerald-600 text-center mb-4">
                    🌱 당신의 PHTI 결과
                </h1>

                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-bold mb-2 text-gray-900">
                        {data.primaryPhti}
                    </h2>
                    <p className="text-gray-700 mb-4">
                        {data.primaryPhtiCustomDescription}
                    </p>

                    <div className="space-y-2 text-sm">
                        <p>📊 에코 성향: {data.ecoChoiceRatio}%</p>
                        <p>📊 가치 소비: {data.valueChoiceRatio}%</p>
                        <p>📊 도전 성향: {data.raffleChoiceRatio}%</p>
                        <p>📊 포인트 사용: {data.pointChoiceRatio}%</p>
                    </div>

                    <hr className="my-4" />

                    <p className="text-gray-600 text-center">
                        🥈 2순위: <b>{data.secondaryPhti}</b> <br />
                        🥉 3순위: <b>{data.tertiaryPhti}</b>
                    </p>
                </div>
            </div>

            {/* 전체 PHTI 유형 리스트 */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">📚 전체 PHTI 유형</h2>
                <div className="
                    grid grid-cols-1 sm:grid-cols-2 gap-4
                    //flex //gap-4 //overflow-x-auto //pb-4
                ">
                    {phtiList.map((item) => {
                        const isPrimary = item.phtiName === data.primaryPhti;
                        const isSecondary = item.phtiName === data.secondaryPhti;
                        const isTertiary = item.phtiName === data.tertiaryPhti;

                        return (
                            <div
                                key={item.phtiId}
                                className={`
                                    p-4 rounded-xl shadow border 
                                    //w-[300px] //flex-shrink-0
                                    ${isPrimary ? "border-emerald-500 bg-emerald-50" : ""}
                                    ${isSecondary ? "border-blue-400 bg-blue-50" : ""}
                                    ${isTertiary ? "border-yellow-400 bg-yellow-50" : ""}
                                `}
                            >
                                <h3 className="font-bold text-lg mb-1 text-gray-900">
                                    {item.phtiAlias}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">{item.phtiName}</p>
                                <p className="text-sm text-gray-700">{item.description}</p>

                                {isPrimary && (
                                    <span className="text-emerald-600 font-bold text-xs">
                                        ✅ 당신의 주 성향
                                    </span>
                                )}
                                {isSecondary && (
                                    <span className="text-blue-500 font-bold text-xs">
                                        🥈 2순위 성향
                                    </span>
                                )}
                                {isTertiary && (
                                    <span className="text-yellow-500 font-bold text-xs">
                                        🥉 3순위 성향
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-lg bg-emerald-600 text-white font-bold"
            >
                홈으로
            </button>
        </div>
    );
};

export default PhtiResult;