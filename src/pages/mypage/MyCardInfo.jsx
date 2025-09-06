import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";

import { CardNumberInput } from "@/components/_custom/CustomInputs";
import { SimpleSelect } from "@/components/_custom/CustomSelect";

import { searchAllCardCompanies } from "@/api_department_core_backend/card/cardCompany.api";
import { deleteMyCardInfo, fetchMyCardInfo, registerMyCardInfo } from "@/api/member_card/memberCard.api";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { useOutletContext } from "react-router-dom";


const MyCardInfo = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("내 카드 관리");
    }, [setTitle]);

    const [cardCompanies, setCardCompanies] = useState([]);
    const [myCards, setMyCards] = useState([]);

    const [cardNumber, setCardNumber] = useState("");
    const [cardCompanyId, setCardCompanyId] = useState("");
    const [showForm, setShowForm] = useState(false);

    const loadCards = async () => {
        const data = await fetchMyCardInfo();
        setMyCards(data.memberCardInfoList || []);
    };

    useEffect(() => {
        searchAllCardCompanies().then((data) => setCardCompanies(data));
        loadCards();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!cardCompanyId) {
            Swal.fire("카드사 선택", "카드사를 선택해주세요.", "warning");
            return;
        }

        if (cardNumber.length !== 16) {
            Swal.fire("카드번호 확인", "카드번호 16자리를 입력해주세요.", "warning");
            return;
        }

        try {
            await registerMyCardInfo({ cardCompanyId, cardNumber });
            Swal.fire("등록 완료", "카드가 정상적으로 등록되었습니다.", "success");
            setCardNumber("");
            setCardCompanyId("");
            setShowForm(false);
            loadCards();
        } catch {
            Swal.fire("에러", "카드 등록 중 오류가 발생했습니다.", "error");
        }
    };

    const handleDelete = async (memberCardId) => {
        try {
            await deleteMyCardInfo(memberCardId);
            Swal.fire("삭제 완료", "카드가 삭제되었습니다.", "success");
            loadCards();
        } catch {
            Swal.fire("에러", "카드 삭제 중 오류가 발생했습니다.", "error");
        }
    };

    // 카드번호 마스킹 처리
    const maskCardNumber = (num) => {
        return num.replace(/\d(?=\d{4})/g, "•");
    };

    return (
        <>
            {/* 등록된 카드 리스트 */}
            <div className="space-y-4 px-2">
                {myCards.map((card) => (
                    <div
                        key={card.memberCardId}
                        className="w-full p-5 
                            relative aspect-[1.585/1]
                            rounded-2xl shadow-lg text-white 
                            bg-gradient-to-r from-emerald-500 to-teal-400
                            "
                    >
                        {/* 카드사 */}
                        <div className="flex justify-between items-start">
                            <span className="text-lg font-semibold">{card.memberCardCompanyName}</span>
                            <button
                                onClick={() => handleDelete(card.memberCardId)}
                                className="text-white hover:text-red-200"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* 카드번호 */}
                        <div className="mt-8 text-xl tracking-widest font-mono">
                            {maskCardNumber(card.cardNumber)}
                        </div>

                        {/* 소유자/기타 */}
                        <div className="absolute bottom-4 left-5 text-sm opacity-80">
                            {/* 등록 카드 ID: {card.memberCardId} */}
                        </div>
                    </div>
                ))}
            </div>

            {/* 카드 등록 버튼 */}
            {!showForm && (
                <div className="fixed w-full max-w-xl bottom-0 left-1/2 -translate-x-1/2 p-4 bg-white border-t">
                    <CustomCommonButton
                        onClick={() => setShowForm(true)}
                        children="+ 새 카드 등록"
                    />
                </div>
            )}

            {/* 카드 등록 폼 */}
            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-6 border-t pt-6">
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">카드사</label>
                        <SimpleSelect
                            value={cardCompanyId}
                            onChange={(e) => setCardCompanyId(e.target.value)}
                            options={cardCompanies.map((c) => ({
                                value: c.cardCompanyId,
                                label: c.name,
                            }))}
                            placeholder="-- 카드사를 선택하세요 --"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">카드번호</label>
                        <CardNumberInput value={cardNumber} onChange={setCardNumber} />
                    </div>

                    <div className="flex gap-2">
                        <CustomCommonButton
                            type="submit"
                            children="등록"
                            className="flex-1"
                        />
                        <CustomCommonButton
                            onClick={() => setShowForm(false)}
                            children="취소"
                            className="flex-1 bg-gray-300 hover:bg-gray-400 !text-black"
                        />
                    </div>
                </form>
            )}
        </>
    );
};

export default MyCardInfo;