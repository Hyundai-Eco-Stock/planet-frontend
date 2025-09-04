import { useLocation, useNavigate } from "react-router-dom";

const PhtiResult = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const data = state?.result;

    if (!data) {
        return <div>잘못된 접근입니다. 설문을 먼저 진행해주세요.</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-emerald-600 text-center">
                🌱 당신의 PHTI 결과
            </h1>

            <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-2">{data.primaryPhti}</h2>
                <p className="text-gray-700 mb-4">{data.primaryPhtiCustomDescription}</p>

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