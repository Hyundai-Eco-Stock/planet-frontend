import { fetchMemberPhtiResult } from "@/api/member/member.api";
import { fetchAllPhtiList } from "@/api/phti/phti.api";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import CustomModal from "@/components/_custom/CustomModal";

const PhtiMain = () => {
    const navigate = useNavigate();

    const { setTitle, setOnClose } = useOutletContext();

    useEffect(() => {
        setTitle("PHTI 결과");

        setOnClose(() => () => {
            navigate("/home/main");
        });

        return () => setOnClose(null);
    }, [setTitle, setOnClose]);

    const [result, setResult] = useState(null);
    const [phtiList, setPhtiList] = useState([]);
    const [showModal, setShowModal] = useState(false);


    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchMemberPhtiResult();
                setResult(data);

                const list = await fetchAllPhtiList();
                if (data) {
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
                } else {
                    setPhtiList(list);
                }
            } catch (err) {
                console.error("PHTI 데이터 조회 실패", err);
            }
        };
        load();
    }, []);

    const handleSurveyClick = () => {
        if (!result) {
            setShowModal(true);  // 결과가 없으면 마케팅/홍보 안내 모달
        } else {
            navigate("/phti/survey");
        }
    };

    return (
        <div className="pb-24 max-w-xl mx-auto space-y-8">
            {/* 최근 결과 */}
            {result ? (
                <div>
                    <h2 className="text-xl font-bold text-emerald-600 text-center mb-4">
                        🌱 당신의 PHTI 결과
                    </h2>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-xl font-bold mb-2 text-gray-900">
                            {result.primaryPhti}
                        </h3>
                        <p className="text-gray-700 mb-4">
                            {result.primaryPhtiCustomDescription}
                        </p>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="mb-1">📊 에코 성향</p>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-emerald-500 h-3 rounded-full"
                                        style={{ width: `${result.ecoChoiceRatio}%` }}
                                    />
                                </div>
                                <p className="text-right text-xs text-gray-500">{result.ecoChoiceRatio}%</p>
                            </div>

                            <div>
                                <p className="mb-1">📊 가치 소비</p>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full"
                                        style={{ width: `${result.valueChoiceRatio}%` }}
                                    />
                                </div>
                                <p className="text-right text-xs text-gray-500">{result.valueChoiceRatio}%</p>
                            </div>

                            <div>
                                <p className="mb-1">📊 도전 성향</p>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-yellow-500 h-3 rounded-full"
                                        style={{ width: `${result.raffleChoiceRatio}%` }}
                                    />
                                </div>
                                <p className="text-right text-xs text-gray-500">{result.raffleChoiceRatio}%</p>
                            </div>

                            <div>
                                <p className="mb-1">📊 포인트 사용</p>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-purple-500 h-3 rounded-full"
                                        style={{ width: `${result.pointChoiceRatio}%` }}
                                    />
                                </div>
                                <p className="text-right text-xs text-gray-500">{result.pointChoiceRatio}%</p>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <p className="text-gray-600 text-center">
                            🥈 2순위: <b>{result.secondaryPhti}</b> <br />
                            🥉 3순위: <b>{result.tertiaryPhti}</b>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    아직 설문 결과가 없습니다. 설문을 먼저 진행해주세요.
                </div>
            )}

            {/* 전체 PHTI 유형 리스트 */}
            {result && (
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        📚 전체 PHTI 유형
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {phtiList.map((item) => {
                            const isPrimary = item.phtiName === result.primaryPhti;
                            const isSecondary = item.phtiName === result.secondaryPhti;
                            const isTertiary = item.phtiName === result.tertiaryPhti;

                            return (
                                <div
                                    key={item.phtiId}
                                    className={`
                                        p-4 rounded-xl shadow border 
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
            )}

            {/* 설문 버튼 */}
            <div className="max-w-xl w-full fixed bottom-0 left-1/2 -translate-x-1/2 bg-white p-4 border-t">
                <CustomCommonButton
                    className="w-full btn-primary"
                    onClick={handleSurveyClick}
                >
                    {result ? '다시 설문하러 가기' : '설문하러 가기'}

                </CustomCommonButton>
            </div>

            {/* 모달 */}
            {showModal && (
                <CustomModal
                    title="마케팅 및 홍보 활용 동의"
                    onClose={() => setShowModal(false)}
                    onConfirm={() => {
                        setShowModal(false);
                        navigate("/phti/survey");
                    }}
                >
                    PHTI 설문 결과는 맞춤형 혜택 제공, 마케팅 및 홍보 목적으로
                    활용될 수 있습니다.
                    계속 진행하시겠습니까?
                </CustomModal>
            )}
        </div>
    );
};

export default PhtiMain;