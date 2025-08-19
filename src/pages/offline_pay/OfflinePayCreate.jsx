import { useEffect, useMemo, useState } from "react";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { CustomCommonInput, CardNumberInput } from "@/components/_custom/CustomInputs";
import { CustomSelect } from "@/components/_custom/CustomSelect";
import { createOfflinePay } from "@/api/offline_pay/offlinePay.api";
import { searchAllDepartmentStore, searchAllShops } from "@/api/department_store/departmentStore.api";
import { searchAllCardCompanies } from "@/api/card/cardCompany.api";

const OfflinePayCreate = () => {
    // 서버에서 불러온 데이터
    const [departmentStores, setDepartmentStores] = useState([]);
    const [shops, setShops] = useState([]);
    const [cardCompanies, setCardCompanies] = useState([]);

    // 선택 상태
    const [storeId, setStoreId] = useState(101);
    const [cardCompanyId, setCardCompanyId] = useState(1);
    const [cardNumber, setCardNumber] = useState("1234123412341234");
    const [items, setItems] = useState([
        { productId: 1, name: "상품 1", price: 15000 },
        { productId: 2, name: "상품 2", price: 25000 },
        { productId: 3, name: "상품 3", price: 5000 },
    ]);

    // API 호출
    useEffect(() => {
        const fetchData = async () => {
            const ds = await searchAllDepartmentStore();
            const sh = await searchAllShops();
            const cc = await searchAllCardCompanies();

            setDepartmentStores(ds ?? []);
            setShops(sh ?? []);
            setCardCompanies(cc ?? []);
        };
        fetchData();
    }, []);

    // 매장 타입 찾기
    const storeType = useMemo(() => {
        const found = shops.find((s) => String(s.offlineShopId) === String(storeId));
        return found?.shopType ?? null;
    }, [storeId, shops]);

    // 금액 계산
    const subtotal = useMemo(
        () => items.filter((it) => Number(it.price) > 0).reduce((acc, it) => acc + Number(it.price || 0), 0),
        [items]
    );
    const discounts = useMemo(
        () => items.filter((it) => Number(it.price) < 0).reduce((acc, it) => acc + Number(it.price || 0), 0),
        [items]
    );
    const total = useMemo(() => subtotal + discounts, [subtotal, discounts]);

    // 유효성 검사
    const isValid = useMemo(() => {
        if (!storeId) return false;
        if (!cardCompanyId) return false;
        const cardDigits = cardNumber.replace(/\D/g, "");
        if (cardDigits.length < 12) return false;
        if (items.length === 0) return false;
        return items.some((it) => Number.isFinite(Number(it.price)));
    }, [storeId, cardCompanyId, cardNumber, items]);

    // 라인 아이템 조작
    const addPaperBagLine = () => setItems((prev) => [...prev, { productId: "PBAG-100", name: "종이백", price: "100" }]);
    const addTumblerDiscountLine = () => setItems((prev) => [...prev, { productId: "TMBL-500", name: "텀블러 할인", price: "-500" }]);
    const addEmptyLine = () => setItems((prev) => [...prev, { productId: "", name: "", price: "" }]);
    const removeLine = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
    const updateItem = (idx, patch) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

    // 제출
    const handleSubmit = async () => {
        if (!isValid) return;
        const payload = {
            storeId: Number(storeId),
            cardCompanyId,
            cardNumber: cardNumber.replace(/\s/g, ""),
            last4: cardNumber.replace(/\D/g, "").slice(-4),
            items: items.filter((it) => it.price !== "").map((it) => ({
                productId: isNaN(Number(it.productId)) ? it.productId : Number(it.productId),
                name: it.name.trim(),
                price: Number(it.price),
            })),
            summary: { subtotal, discounts, total },
        };
        await createOfflinePay(payload);
    };

    return (
        <div className="space-y-6 p-4">
            {/* 0. 매장 정보 */}
            <section>
                <h3 className="mb-2 text-base font-semibold">매장 정보</h3>
                <div>
                    <div className="mb-1 text-sm font-medium">매장 선택</div>
                    <CustomSelect
                        value={storeId ?? ""}
                        onChange={(e) => setStoreId(e.target.value)}
                        placeholder="매장을 선택하세요"
                        optgroups={departmentStores.map((dept) => ({
                            id: dept.departmentStoreId,
                            label: dept.name,
                            options: shops
                                .filter((s) => s.departmentStoreId === dept.departmentStoreId)
                                .map((s) => ({
                                    value: s.offlineShopId,
                                    label: s.shopName,
                                })),
                        }))}
                    />
                </div>
            </section>

            {/* 1. 카드 정보 */}
            <section>
                <h3 className="mb-2 text-base font-semibold">카드 정보</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                        <div className="mb-1 text-sm font-medium">카드 회사</div>
                        <CustomSelect
                            value={cardCompanyId ?? ""}
                            onChange={(e) => setCardCompanyId(Number(e.target.value))}
                            placeholder="카드사를 선택하세요"
                            options={cardCompanies.map((c) => ({
                                value: c.cardCompanyId,
                                label: c.name,
                            }))}
                        />
                    </div>
                    <div>
                        <div className="mb-1 text-sm font-medium">카드 번호</div>
                        <CardNumberInput value={cardNumber} onChange={setCardNumber} />
                    </div>
                </div>
            </section>

            {/* 2. 상품 목록 */}
            <section>
                <div className="mb-2 flex gap-2 items-center">
                    <h3 className="text-base font-semibold">상품 목록</h3>
                    <div className="flex gap-1 flex-1">
                        <CustomCommonButton onClick={addEmptyLine}>상품 추가</CustomCommonButton>
                        {storeType === "FOOD_MALL" && <CustomCommonButton onClick={addPaperBagLine}>종이백</CustomCommonButton>}
                        {storeType === "CAFE" && <CustomCommonButton onClick={addTumblerDiscountLine}>텀블러 할인</CustomCommonButton>}
                    </div>
                </div>

                <div className="space-y-3">
                    {items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-lg border p-3">
                            <CustomCommonInput className="w-24" value={it.productId} onChange={(e) => updateItem(idx, { productId: e.target.value })} placeholder="상품ID" />
                            <CustomCommonInput className="flex-1" value={it.name} onChange={(e) => updateItem(idx, { name: e.target.value })} placeholder="상품 이름" />
                            <CustomCommonInput className="w-28" value={it.price} onChange={(e) => updateItem(idx, { price: e.target.value })} placeholder="가격" type="number" inputMode="numeric" />
                            <button type="button" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50" onClick={() => removeLine(idx)}>
                                삭제
                            </button>
                        </div>
                    ))}
                </div>

                {/* 합계 */}
                <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div className="rounded-lg border p-3">
                        <div className="text-sm text-gray-500">상품 합계(양수)</div>
                        <div className="text-lg font-semibold">{subtotal.toLocaleString()} 원</div>
                    </div>
                    <div className="rounded-lg border p-3">
                        <div className="text-sm text-gray-500">할인 합계(음수)</div>
                        <div className="text-lg font-semibold">{discounts.toLocaleString()} 원</div>
                    </div>
                    <div className="rounded-lg border p-3">
                        <div className="text-sm text-gray-500">총 결제 금액</div>
                        <div className="text-2xl font-bold">{total.toLocaleString()} 원</div>
                    </div>
                </div>
            </section>

            {/* 제출 */}
            <div className="pt-2">
                <CustomCommonButton onClick={handleSubmit} disabled={!isValid}>오프라인 결제</CustomCommonButton>
                {!isValid && (
                    <p className="mt-2 text-xs text-red-500">
                        매장/카드정보와 최소 1개 이상의 유효한 금액 라인을 입력하세요.
                    </p>
                )}
            </div>
        </div>
    );
};

export default OfflinePayCreate;