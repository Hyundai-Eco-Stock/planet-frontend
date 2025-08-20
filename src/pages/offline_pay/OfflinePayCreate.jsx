import { useEffect, useMemo, useState } from "react";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { CustomCommonInput, CardNumberInput } from "@/components/_custom/CustomInputs";
import { CustomSelect } from "@/components/_custom/CustomSelect";
import { createOfflinePay } from "@/api/offline_pay/offlinePay.api";
import { searchAllDepartmentStore, searchAllShops } from "@/api/department_store/departmentStore.api";
import { searchAllCardCompanies } from "@/api/card/cardCompany.api";
import { searchAllShopProducts } from "@/api/department_store/departmentStore.api";
import Swal from "sweetalert2";

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

    // 금액 합계
    const subtotal = useMemo(
        () => items.filter((it) => Number(it.price) > 0).reduce((acc, it) => acc + Number(it.price || 0), 0),
        [items]
    );
    const discounts = useMemo(
        () => items.filter((it) => Number(it.price) < 0).reduce((acc, it) => acc + Number(it.price || 0), 0),
        [items]
    );
    const total = useMemo(() => subtotal + discounts, [subtotal, discounts]);

    // 아이템 조작
    const addItem = (p) => setItems((prev) => [...prev, { productId: p.productId, name: p.name, price: p.price }]);
    const removeLine = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

    // 제출
    const handleSubmit = async () => {
        const payload = {
            shopId: Number(shopId),
            cardCompanyId,
            cardNumber: cardNumber.replace(/\s/g, ""),
            last4: cardNumber.replace(/\D/g, "").slice(-4),
            items: items.map((it) => ({
                productId: it.productId,
                name: it.name,
                price: Number(it.price),
            })),
            summary: { subtotal, discounts, total },
        };

        try {
            await createOfflinePay(payload);
            // ✅ 결제 완료 알림
            Swal.fire({
                icon: "success",
                title: "결제 완료",
                text: `총 ${total.toLocaleString()}원이 결제되었습니다.`,
                confirmButtonText: "확인",
                confirmButtonColor: "#10b981", // Tailwind emerald 계열
            });
            // 결제 완료 후 장바구니 비우기
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
                                    .filter((s) => s.departmentStoreId === dept.departmentStoreId)
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
                        <div key={idx} className="flex justify-between items-center border p-2 rounded">
                            <span>{it.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{it.price.toLocaleString()}원</span>
                                <button className="text-red-500" onClick={() => removeLine(idx)}>X</button>
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
                    <CustomCommonButton className="w-full mt-2 bg-black" onClick={handleSubmit} children="결제하기" />
                </div>
            </div>

            {/* 우측 상품 선택 */}
            <div className="flex-1 grid grid-cols-4 gap-3 p-4 bg-gray-50">
                {products.map((p) => (
                    <button
                        key={p.productId}
                        className={`${(p.name == '텀블러 할인' || p.name == '종이백') ? 'bg-emerald-300' : 'bg-emerald-500 hover:bg-emerald-600'} text-white p-3 rounded-lg text-sm`}
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