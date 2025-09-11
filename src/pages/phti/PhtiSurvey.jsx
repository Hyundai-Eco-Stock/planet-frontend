import ClipLoader from "react-spinners/ClipLoader";

import { useEffect, useState } from "react";
import { fetchPhtiQuestinosAndChoices, submitPhtiSurvey } from "@/api/phti/phti.api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import Swal from "sweetalert2";

const variants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
    }),
};

const PhtiSurvey = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchPhtiQuestinosAndChoices();
            setQuestions(data);
            console.log(data)
        };
        fetchData();
    }, []);

    const handleNext = () => {
        const currentQuestionId = questions[currentIndex].questionId;
        if (!answers[currentQuestionId]) return;

        if (currentIndex < questions.length - 1) {
            setDirection(1);
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleNotAnsweredQuestion = () => {
        for (let i = 0; i < questions.length; i++) {
            if (!answers[questions[i].questionId]) {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
                return;
            }
        }
    };

    const handleChoiceSelect = (questionId, choiceId) => {
        setAnswers((prev) => {
            const updated = {
                ...prev,
                [questionId]: choiceId,
            };

            if (currentIndex < questions.length - 1) {
                setDirection(1);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            }

            return updated;
        });
    };

    const handleSubmit = async () => {
        const payload = {
            answers: Object.entries(answers).map(([questionId, choiceId]) => ({
                questionId: Number(questionId),
                choiceId
            }))
        };
        try {
            setLoading(true);
            const data = await submitPhtiSurvey(payload);
            console.log(data);
            navigate("/phti/main", { state: { result: data } });
        } finally {
            setLoading(false);
        }
    };

    const handleForceNavigateToUnanswered = () => {
        Swal.fire({
            icon: "warning",
            title: "답변하지 않은 문항이 있어요",
            text: "먼저 모든 문항에 답변해주세요.",
            confirmButtonText: "확인",
            confirmButtonColor: "#10B981",
            timer: 900,
        });

        for (let i = 0; i < questions.length; i++) {
            if (!answers[questions[i].questionId]) {
                setCurrentIndex(i);
                setDirection(1);
                return;
            }
        }
    };

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-2xl">🧠</span>
                    </div>
                    <p className="text-gray-600 font-medium">검사 문항을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const isFirstPage = currentIndex === 0;
    const isLastPage = currentIndex === questions.length - 1;
    const allAnswered = Object.keys(answers).length === questions.length;
    const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-white">
            {/* 상단 진행률 바 */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900">PHTI 검사</span>
                        <span className="text-sm font-medium text-gray-600">
                            {currentIndex + 1} / {questions.length}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <main className="px-4 py-8 pb-32">
                <div className="max-w-xl mx-auto">
                    <AnimatePresence custom={direction} mode="wait">
                        <motion.div
                            key={questions[currentIndex].questionId}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25 }}
                            className="space-y-6"
                        >
                            {/* 질문 카드 */}
                            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-8 shadow-lg">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                        <span className="text-2xl font-bold text-white">Q{questions[currentIndex].questionOrder}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
                                        {questions[currentIndex].questionText}
                                    </h2>
                                </div>
                            </div>

                            {/* 선택지 */}
                            <div className="space-y-3">
                                {questions[currentIndex].choices.map((choice, index) => {
                                    const isSelected = answers[questions[currentIndex].questionId] === choice.choiceId;

                                    return (
                                        <button
                                            key={choice.choiceId}
                                            className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-medium ${
                                                isSelected
                                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg"
                                                    : "bg-white border-gray-200 hover:border-gray-300 text-gray-900 hover:shadow-md"
                                            }`}
                                            onClick={() =>
                                                handleChoiceSelect(
                                                    questions[currentIndex].questionId,
                                                    choice.choiceId
                                                )
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="flex-1 leading-relaxed">
                                                    {choice.choiceText}
                                                </span>
                                                {isSelected && (
                                                    <div className="ml-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 네비게이션 버튼 */}
                            <div className="flex justify-between items-center pt-6">
                                <button
                                    onClick={handleBack}
                                    disabled={isFirstPage}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        isFirstPage
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95"
                                    }`}
                                >
                                    ← 이전
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={isLastPage || !answers[questions[currentIndex].questionId]}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        isLastPage || !answers[questions[currentIndex].questionId]
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:scale-95 shadow-md"
                                    }`}
                                >
                                    다음 →
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border-t border-gray-200 z-50" style={{ height: '85px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div className="px-4 pt-3 pb-6 h-full flex items-start">
                    <button
                        onClick={allAnswered ? handleSubmit : handleForceNavigateToUnanswered}
                        disabled={loading}
                        className={`w-full py-3 rounded-xl font-bold text-base transition-all duration-200 ${
                            allAnswered && !loading
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:scale-[0.98] shadow-lg"
                                : "bg-gray-200 text-gray-500"
                        }`}
                    >
                        {loading ? "분석 중..." : allAnswered ? "🧠 결과 확인하기" : `${Object.keys(answers).length}/${questions.length} 답변 완료`}
                    </button>
                </div>
            </div>

            {/* 로딩 오버레이 */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
                    <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <span className="text-3xl">🧠</span>
                        </div>
                        <div className="mb-4">
                            <ClipLoader size={40} color="#8B5CF6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">결과 분석 중</h3>
                        <p className="text-gray-600 text-sm">당신만의 PHTI를 찾고 있어요...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhtiSurvey;