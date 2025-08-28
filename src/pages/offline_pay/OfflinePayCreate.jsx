import Swal from "sweetalert2";

import { useEffect, useMemo, useState } from "react";

import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { CardNumberInput } from "@/components/_custom/CustomInputs";
import { CustomSelect } from "@/components/_custom/CustomSelect";

import { createOfflinePay } from "@/api_department_core_backend/offline_pay/offlinePay.api";
import { searchAllDepartmentStore } from "@/api/department_store/departmentStore.api";
import { searchAllCardCompanies } from "@/api_department_core_backend/card/cardCompany.api";
import { searchAllShopProducts, searchAllShops } from "@/api_department_core_backend/department_store_shop/departmentStoreShop.api";


const OfflinePayCreate = () => {
    // 서버 데이터
    const [departmentStores, setDepartmentStores] = useState([]);
    const [shops, setShops] = useState([]);
    const [cardCompanies, setCardCompanies] = useState([]);
    const [products, setProducts] = useState([]);

    // 선택 상태
    const [shopId, setShopId] = useState(101);
    const [cardCompanyId, setCardCompanyId] = useState(1);
    const [cardNumber, setCardNumber] = useState("1234123412341234");
    const [items, setItems] = useState([]);

    // 데이터 fetch
    useEffect(() => {
        const fetchData = async () => {
            const ds = await searchAllDepartmentStore();
            const sh = await searchAllShops();
            const cc = await searchAllCardCompanies();
            const p = await searchAllShopProducts(shopId);

            setDepartmentStores(ds ?? []);
            setShops(sh ?? []);
            setCardCompanies(cc ?? []);
            setProducts(p ?? []);
        };
        fetchData();
    }, [shopId]);

    // 매장 타입
    const storeType = useMemo(() => {
        const found = shops.find((s) => String(s.offlineShopId) === String(shopId));
        return found?.shopType ?? null;
    }, [shopId, shops]);

    // 금액 합계 (수량 반영)
    const subtotal = useMemo(
        () =>
            items
                .filter((it) => it.price > 0)
                .reduce((acc, it) => acc + it.price * it.amount, 0),
        [items]
    );
    const discounts = useMemo(
        () =>
            items
                .filter((it) => it.price < 0)
                .reduce((acc, it) => acc + it.price * it.amount, 0),
        [items]
    );
    const total = useMemo(() => subtotal + discounts, [subtotal, discounts]);

    // 아이템 조작
    const addItem = (p) => {
        setItems((prev) => {
            const idx = prev.findIndex((it) => it.productId === p.productId);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = {
                    ...updated[idx],
                    amount: updated[idx].amount + 1,
                };
                return updated;
            }
            return [
                ...prev,
                { productId: p.productId, name: p.name, price: p.price, amount: 1 },
            ];
        });
    };

    const removeLine = (idx) =>
        setItems((prev) => prev.filter((_, i) => i !== idx));

    // 제출
    const handleSubmit = async () => {
        if (total <= 0) {
            Swal.fire({
                icon: "warning",
                title: "결제 불가",
                text: "총 결제 금액이 0원보다 커야 합니다.",
                confirmButtonText: "확인",
                confirmButtonColor: "#f59e0b",
            });
            return;
        }

        const payload = {
            posId: 69, // 임의 값
            dailySeq: 948732, // 임의 값
            shopId: Number(shopId),
            cardCompanyId,
            cardNumber: cardNumber.replace(/\s/g, ""),
            last4: cardNumber.replace(/\D/g, "").slice(-4),
            items: items.map((it) => ({
                productId: it.productId,
                amount: it.amount,
            })),
            summary: { subtotal, discounts, total },
        };

        try {
            await createOfflinePay(payload);
            Swal.fire({
                icon: "success",
                title: "결제 완료",
                text: `총 ${total.toLocaleString()}원이 결제되었습니다.`,
                confirmButtonText: "확인",
                confirmButtonColor: "#10b981",
            });
            setItems([]);
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "결제 실패",
                text: "결제 처리 중 오류가 발생했습니다.",
                confirmButtonText: "확인",
                confirmButtonColor: "#ef4444",
            });
        }
    };

    return (
        <div className="flex h-full">
            {/* 좌측 주문 내역 */}
            <div className="w-1/3 border-r flex flex-col">
                {/* 매장/카드 정보 */}
                <div className="p-3 space-y-3 border-b bg-gray-50">
                    <div>
                        <div className="text-sm font-medium">매장 선택</div>
                        <CustomSelect
                            value={shopId ?? ""}
                            onChange={(e) => setShopId(Number(e.target.value))}
                            placeholder="매장을 선택하세요"
                            optgroups={departmentStores.map((dept) => ({
                                id: dept.departmentStoreId,
                                label: dept.name,
                                options: shops
                                    .filter(
                                        (s) => s.departmentStoreId === dept.departmentStoreId
                                    )
                                    .map((s) => ({
                                        value: s.offlineShopId,
                                        label: s.shopName,
                                    })),
                            }))}
                        />
                    </div>

                    <div>
                        <div className="text-sm font-medium">카드사</div>
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
                        <div className="text-sm font-medium">카드 번호</div>
                        <CardNumberInput value={cardNumber} onChange={setCardNumber} />
                    </div>
                </div>

                {/* 주문 내역 */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {items.map((it, idx) => (
                        <div
                            key={idx}
                            className="flex justify-between items-center border p-2 rounded gap-3"
                        >
                            <span className="font-medium flex-1">{it.name}</span>

                            {/* 합계 금액 */}
                            <span className="font-medium">
                                {(it.price * it.amount).toLocaleString()}원
                            </span>

                            <div className="flex items-center gap-2">
                                {/* [-] [개수입력] [+] */}
                                <div className="flex items-center gap-1">
                                    <button
                                        className="px-2 py-1 border rounded bg-gray-200"
                                        onClick={() =>
                                            setItems((prev) => {
                                                const updated = [...prev];
                                                updated[idx] = {
                                                    ...updated[idx],
                                                    amount: updated[idx].amount - 1,
                                                };
                                                if (updated[idx].amount <= 0) {
                                                    updated.splice(idx, 1);
                                                }
                                                return updated;
                                            })
                                        }
                                    >
                                        -
                                    </button>

                                    {/* ✅ 숫자 직접 입력 가능 */}
                                    <input
                                        type="number"
                                        min="0"
                                        value={it.amount}
                                        onChange={(e) =>
                                            setItems((prev) => {
                                                const updated = [...prev];
                                                const newVal = Number(e.target.value);
                                                if (isNaN(newVal)) {
                                                    updated.splice(idx, 1);
                                                } else if (newVal <= 0) {
                                                    // 0 이하 입력 시 제거
                                                    updated.splice(idx, 1);
                                                } else {
                                                    updated[idx] = {
                                                        ...updated[idx],
                                                        amount: newVal,
                                                    };
                                                }
                                                return updated;
                                            })
                                        }
                                        className="
                                            w-12 text-center border rounded
                                            [appearance:textfield] 
                                            [&::-webkit-outer-spin-button]:appearance-none 
                                            [&::-webkit-inner-spin-button]:appearance-none
                                        "
                                    />

                                    <button
                                        className="px-2 py-1 border rounded bg-gray-200"
                                        onClick={() =>
                                            setItems((prev) => {
                                                const updated = [...prev];
                                                updated[idx] = {
                                                    ...updated[idx],
                                                    amount: updated[idx].amount + 1,
                                                };
                                                return updated;
                                            })
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 합계 */}
                <div className="border-t p-3 space-y-2 bg-gray-100">
                    <div className="flex justify-between">
                        <span>상품 합계</span>
                        <span>{subtotal.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                        <span>할인 합계</span>
                        <span>{discounts.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>총 결제 금액</span>
                        <span>{total.toLocaleString()}원</span>
                    </div>
                    <CustomCommonButton
                        className="w-full mt-2 bg-black"
                        onClick={handleSubmit}
                        disabled={total <= 0}
                    >
                        결제하기
                    </CustomCommonButton>
                </div>
            </div>

            {/* 우측 상품 선택 */}
            <div className="flex-1 grid grid-cols-4 gap-3 p-4 bg-gray-50">
                {products.map((p) => (
                    <button
                        key={p.productId}
                        className={`${p.name === "텀블러 할인" || p.name === "종이백"
                            ? "bg-emerald-300"
                            : "bg-emerald-500 hover:bg-emerald-600"
                            } text-white p-3 rounded-lg text-sm`}
                        onClick={() => addItem(p)}
                    >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs">{p.price.toLocaleString()}원</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OfflinePayCreate;