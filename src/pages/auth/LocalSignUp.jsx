// src/pages/Signup.tsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";

const LocalSignup = () => {
    const nav = useNavigate();

    // 입력 상태
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [sex, setSex] = useState("F");
    const [yyyy, setYYYY] = useState("");
    const [mm, setMM] = useState("");
    const [dd, setDD] = useState("");

    // 간단한 유효성
    const pwMatch = password.length > 0 && password === passwordAgain;
    const birthValid =
        /^\d{4}$/.test(yyyy) &&
        /^(0?[1-9]|1[0-2])$/.test(mm) &&
        /^(0?[1-9]|[12]\d|3[01])$/.test(dd);

    const canSubmit = pwMatch && birthValid;

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        // TODO: API 엔드포인트에 맞게 수정
        // 예) POST /api/members
        // body: { email, name, pwd, sex, birth: `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}` }
        try {
            // await api.signup({ ... })
            nav("/login", { replace: true });
        } catch (err) {
            console.error(err);
            alert("회원가입 중 오류가 발생했어요.");
        }
    };

    return (
        <div className="mx-auto max-w-[640px] px-6 pt-6 pb-28">
            {/* 상단 제목 */}
            <h1 className="text-center text-2xl font-extrabold tracking-tight mb-8">회원가입</h1>

            <form onSubmit={onSubmit} className="space-y-5">
                {/* 이메일 (읽기 전용) */}
                <div>
                    <label className="block mb-2 text-sm text-black/70">이메일</label>
                    <CustomCommonInput
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력해주세요."
                    />
                </div>

                {/* 이름 (읽기 전용) */}
                <div>
                    <label className="block mb-2 text-sm text-black/70">이름</label>
                    <CustomCommonInput
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력해주세요."
                    />
                </div>

                {/* 비밀번호 */}
                <div>
                    <label className="block mb-2 text-sm text-black/70">비밀번호</label>
                    <CustomCommonInput
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="사용할 비밀번호를 입력해주세요."
                        aria-label="비밀번호"
                        className="w-full px-4 py-4 rounded-xl outline-none"
                    />
                </div>

                {/* 비밀번호 재입력 */}
                <div>
                    <label className="block mb-2 text-sm text-black/70">비밀번호 재입력</label>
                    <CustomCommonInput
                        type="password"
                        value={passwordAgain}
                        onChange={(e) => setPasswordAgain(e.target.value)}
                        placeholder="비밀번호를 다시 한번 입력해주세요."
                    />
                    {!pwMatch && passwordAgain.length > 0 && (
                        <p className="mt-1 text-sm text-red-500">비밀번호가 일치하지 않습니다.</p>
                    )}
                </div>

                {/* 성별 */}
                <div>
                    <label className="block mb-2 text-sm text-black/70">성별</label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setSex("M")}
                            className={[
                                "flex-1 px-4 py-3 rounded-xl border text-center font-medium transition",
                                sex === "M"
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-white text-black border-black/20"
                            ].join(" ")}
                        >
                            남자
                        </button>
                        <button
                            type="button"
                            onClick={() => setSex("F")}
                            className={[
                                "flex-1 px-4 py-3 rounded-xl border text-center font-medium transition",
                                sex === "F"
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-white text-black border-black/20"
                            ].join(" ")}
                        >
                            여자
                        </button>
                    </div>
                </div>

                {/* 생년월일 */}
                <div>
                    <label className="block mb-2 text-sm text-black/70">생년월일</label>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-black/20 focus-within:border-emerald-500 transition-colors">
                            <input
                                inputMode="numeric"
                                maxLength={4}
                                value={yyyy}
                                onChange={(e) => setYYYY(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                placeholder="YYYY"
                                aria-label="연도"
                                className="w-[90px] px-4 py-3 rounded-xl outline-none text-center"
                            />
                        </div>
                        <span className="text-black/60 text-sm">년</span>

                        <div className="rounded-xl border border-black/20 focus-within:border-emerald-500 transition-colors">
                            <input
                                inputMode="numeric"
                                maxLength={2}
                                value={mm}
                                onChange={(e) => setMM(e.target.value.replace(/\D/g, "").slice(0, 2))}
                                placeholder="MM"
                                aria-label="월"
                                className="w-[70px] px-4 py-3 rounded-xl outline-none text-center"
                            />
                        </div>
                        <span className="text-black/60 text-sm">월</span>

                        <div className="rounded-xl border border-black/20 focus-within:border-emerald-500 transition-colors">
                            <input
                                inputMode="numeric"
                                maxLength={2}
                                value={dd}
                                onChange={(e) => setDD(e.target.value.replace(/\D/g, "").slice(0, 2))}
                                placeholder="dd"
                                aria-label="일"
                                className="w-[70px] px-4 py-3 rounded-xl outline-none text-center"
                            />
                        </div>
                        <span className="text-black/60 text-sm">일</span>
                    </div>
                    {!birthValid && (yyyy || mm || dd) && (
                        <p className="mt-1 text-sm text-red-500">생년월일을 정확히 입력하세요.</p>
                    )}
                </div>

                {/* 제출 버튼 */}
                <div className="pt-6">
                    <CustomCommonButton
                        type="submit"
                        disabled={!canSubmit}
                        className="w-full py-4 rounded-xl text-white text-lg font-extrabold bg-emerald-500 disabled:opacity-50 hover:bg-emerald-600 transition"
                    >
                        회원가입
                    </CustomCommonButton>
                </div>
            </form>
        </div>
    );
};

export default LocalSignup;