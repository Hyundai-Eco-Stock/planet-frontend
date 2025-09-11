import ClipLoader from "react-spinners/ClipLoader";

import { useEffect, useState } from "react";
import { fetchPhtiQuestinosAndChoices, submitPhtiSurvey } from "@/api/phti/phti.api";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useOutletContext } from "react-router-dom";
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

    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("PHTI 설문");
    }, [setTitle]);

    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // 이동 방향 저장

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

    // 바로 다음 질문으로 넘어가기
    const handleNext = () => {
        const currentQuestionId = questions[currentIndex].questionId;
        // 선택 안 했으면 넘어가지 않음
        if (!answers[currentQuestionId]) return;

        if (currentIndex < questions.length - 1) {
            setDirection(1); // 앞으로
            setCurrentIndex((prev) => prev + 1);
        }
    };

    // 바로 직전 질문으로 돌아가기
    const handleBack = () => {
        if (currentIndex > 0) {
            setDirection(-1); // 뒤로
            setCurrentIndex((prev) => prev - 1);
        }
    };

    // 아직 답변 안 한 질문으로 이동
    const handleNotAnsweredQuestion = () => {
        for (let i = 0; i < questions.length; i++) {
            if (!answers[questions[i].questionId]) {
                setDirection(i > currentIndex ? 1 : -1); // 현재 위치와 비교해 방향 지정
                setCurrentIndex(i);
                return;
            }
        }
    };

    // choice 선택
    const handleChoiceSelect = (questionId, choiceId) => {
        setAnswers((prev) => {
            const updated = {
                ...prev,
                [questionId]: choiceId,
            };

            // 선택이 반영된 뒤 자동 다음으로 이동
            if (currentIndex < questions.length - 1) {
                setDirection(1);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            }

            // 답변 안한 질문으로 이동
            // handleNotAnsweredQuestion();

            // 다음 질문으로 이동
            // handleNext();
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
            confirmButtonColor: "#10B981", // 초록색 (Tailwind emerald 계열)
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

    if (questions.length === 0) return <div>로딩중...</div>;

    const isFirstPage = currentIndex === 0;
    const isLastPage = currentIndex === questions.length - 1;
    const allAnswered = Object.keys(answers).length === questions.length;

    return (
        <div className="h-full flex flex-col items-center justify-center p-2">
            <div className="w-full max-w-xl h-full bg-white shadow-lg rounded-2xl p-6 relative overflow-hidden">
                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={questions[currentIndex].questionId}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="h-full flex flex-col"
                    >
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            Q{questions[currentIndex].questionOrder}.{" "}
                            {questions[currentIndex].questionText}
                        </h2>
                        <div className="space-y-3">
                            {
                                questions[currentIndex].choices.map((choice) => {
                                    const isSelected = answers[questions[currentIndex].questionId] === choice.choiceId;

                                    return (
                                        <button
                                            key={choice.choiceId}
                                            className={`w-full text-left px-4 py-3 rounded-xl border transition 
                                                    ${isSelected
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-white border-gray-300 hover:bg-emerald-50"
                                                }`}
                                            onClick={() =>
                                                handleChoiceSelect(
                                                    questions[currentIndex].questionId,
                                                    choice.choiceId
                                                )
                                            }
                                        >
                                            {choice.choiceText}
                                        </button>
                                    )
                                })
                            }
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* 하단 네비게이션 */}
                <div className="flex justify-between items-center mt-6">
                    <div className="flex-1 flex justify-start items-center">
                        {
                            !isFirstPage &&
                            <button
                                onClick={handleBack}
                                disabled={currentIndex === 0}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 disabled:opacity-50"
                            >
                                뒤로
                            </button>
                        }
                    </div>

                    <span className="flex-1 text-sm text-center text-gray-500">
                        {currentIndex + 1} / {questions.length}
                    </span>

                    <div className="flex-1 flex justify-end items-center">
                        {
                            !isLastPage &&
                            <button
                                onClick={handleNext}
                                disabled={currentIndex === questions.length - 1}
                                className="px-4 py-2 rounded-lg bg-emerald-500 text-white disabled:opacity-50"
                            >
                                다음
                            </button>
                        }
                    </div>
                </div>
            </div>

            {/* 제출 버튼 */}
            <div className="max-w-xl w-full fixed bottom-0 left-1/2 -translate-x-1/2 bg-white p-4 border-t">
                <CustomCommonButton
                    onClick={allAnswered ? handleSubmit : handleForceNavigateToUnanswered}
                    children={allAnswered ? "제출하기" : "답변 완료 후 제출"}
                />
            </div>

            {/* 페이지네이션 */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {questions.map((q, idx) => {
                    const answered = answers[q.questionId];
                    const isCurrent = idx === currentIndex;
                    return (
                        <button
                            key={q.questionId}
                            onClick={() => {
                                setCurrentIndex(idx);
                                setDirection(idx > currentIndex ? 1 : -1);
                            }}
                            className={`
                                w-6 h-6 rounded-full text-xs font-bold
                                flex items-center justify-center
                                ${isCurrent ? "bg-emerald-500 text-white" : answered ? "bg-emerald-300" : "bg-gray-100"}
                            `}
                        >
                            {answered ? "✓" : idx + 1}
                        </button>
                    );
                })}
            </div>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <ClipLoader size={60} color="#10B981" />
                    <span className="ml-4 text-white font-medium">제출 중입니다...</span>
                </div>
            )}
        </div>
    );
};

export default PhtiSurvey;