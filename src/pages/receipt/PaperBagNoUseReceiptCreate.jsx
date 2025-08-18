import { useEffect, useMemo, useState } from "react";
import { createPaperBagNoUseReceipt } from "@/api/receipt/receipt.api";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { CustomCommonInput } from "@/components/_custom/CustomInputs";
import { searchAllMembers } from "@/api/member/member.api";


const PaperBagNoUseReceiptCreate = () => {
    const [memberId, setMemberId] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [itemCount, setItemCount] = useState("");
    const [bagKeywordFound, setBagKeywordFound] = useState(false);

    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [memberLoadError, setMemberLoadError] = useState("");
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const valid =
            memberId.trim() !== "" // &&
            // totalAmount.trim() !== "" &&
            // itemCount.trim() !== "" &&
            // Number(totalAmount) > 0 &&
            // Number.isFinite(Number(totalAmount)) &&
            // Number(itemCount) > 0 &&
            // Number.isInteger(Number(itemCount));
        setIsValid(valid);
    }, [memberId, totalAmount, itemCount]);

    useEffect(() => {
        const loadMembers = async () => {
            try {
                setLoadingMembers(true);
                setMemberLoadError("");
                const list = await searchAllMembers(); // 기대형식: [{id, name, email}, ...]
                setMembers(Array.isArray(list) ? list : []);
            } catch (e) {
                setMemberLoadError("멤버 목록을 불러오지 못했습니다.");
                setMembers([]);
            } finally {
                setLoadingMembers(false);
            }
        };
        loadMembers();
    }, []);

    const handleSubmit = () => {
        if (!isValid) return;

        createPaperBagNoUseReceipt(
            Number(memberId),
            // Number(totalAmount),
            // Number(itemCount),
            Boolean(bagKeywordFound),
        );
    };

    return (
        <div className="space-y-4 p-4">
            {/* <div>
                <div className="mb-1 text-sm font-medium">이벤트 ID</div>
                <CustomCommonInput
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)} // CustomCommonInput이 value 값을 직접 넘겨준다는 전제
                    placeholder="예: evt-20250816-0001"
                />
            </div> */}

            <div>
                <div className="mb-1 text-sm font-medium">멤버</div>
                <div className="flex items-center gap-2">
                    <select
                        className="w-full rounded-lg border px-3 py-2"
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        disabled={loadingMembers}
                    >
                        <option value="">{loadingMembers ? "불러오는 중..." : "멤버를 선택하세요"}</option>
                        {members.map((m) => {
                            return (
                                <option key={m.id} value={m.id}>
                                    {m.name} {m.email}
                                </option>
                            );
                        })}
                    </select>
                    {memberLoadError && (
                        <span className="text-xs text-red-500">{memberLoadError}</span>
                    )}
                </div>
            </div>

            {/* <div>
                <div className="mb-1 text-sm font-medium">총 금액</div>
                <CustomCommonInput
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    type="number"
                    inputMode="numeric"
                    placeholder="예: 65000"
                />
            </div>

            <div>
                <div className="mb-1 text-sm font-medium">아이템 개수</div>
                <CustomCommonInput
                    value={itemCount}
                    onChange={(e) => setItemCount(e.target.value)}
                    type="number"
                    inputMode="numeric"
                    placeholder="예: 12"
                />
            </div> */}

            <div className="flex items-center gap-2">
                <input
                    id="bagKeywordFound"
                    type="checkbox"
                    checked={bagKeywordFound}
                    onChange={(e) => setBagKeywordFound(e.target.checked)}
                    className="h-4 w-4"
                />
                <label htmlFor="bagKeywordFound" className="text-sm">
                    영수증에 장바구니(일회용품 미사용) 키워드 감지
                </label>
            </div>

            <div className="pt-2">
                <CustomCommonButton onClick={handleSubmit} disabled={!isValid}>
                    영수증 이벤트 전송
                </CustomCommonButton>
            </div>
        </div>
    );
};

export default PaperBagNoUseReceiptCreate;