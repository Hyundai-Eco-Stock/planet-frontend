import Swal from "sweetalert2";
import { useEffect, useMemo, useState } from "react";

import { createOfflinePay } from "@/api_department_core_backend/offline_pay/offlinePay.api";
import { searchAllDepartmentStore } from "@/api/department_store/departmentStore.api";
import { searchAllCardCompanies } from "@/api_department_core_backend/card/cardCompany.api";
import { searchAllShopProducts, searchAllShops } from "@/api_department_core_backend/department_store_shop/departmentStoreShop.api";

import OrderHeader from "@/components/pos/OrderHeader";
import OrderItems from "@/components/pos/OrderItems";
import OrderSummary from "@/components/pos/OrderSummary";
import ProductGrid from "@/components/pos/ProductGrid";

const OfflinePayCreate = () => {
    const [departmentStores, setDepartmentStores] = useState([]);
    const [shops, setShops] = useState([]);
    const [cardCompanies, setCardCompanies] = useState([]);
    const [products, setProducts] = useState([]);

    const [shopId, setShopId] = useState(101);
    const [cardCompanyId, setCardCompanyId] = useState(1);
    const [cardNumber, setCardNumber] = useState("1111111111111111");
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setDepartmentStores(await searchAllDepartmentStore() ?? []);
            setShops(await searchAllShops() ?? []);
            setCardCompanies(await searchAllCardCompanies() ?? []);
            setProducts(await searchAllShopProducts(shopId) ?? []);
        };
        fetchData();
    }, [shopId]);

    const subtotal = useMemo(
        () => items.filter((it) => it.price > 0).reduce((acc, it) => acc + it.price * it.amount, 0),
        [items]
    );
    const discounts = useMemo(
        () => items.filter((it) => it.price < 0).reduce((acc, it) => acc + it.price * it.amount, 0),
        [items]
    );
    const total = useMemo(() => subtotal + discounts, [subtotal, discounts]);

    const addItem = (p) => {
        setItems((prev) => {
            const idx = prev.findIndex((it) => it.productId === p.productId);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx].amount += 1;
                return updated;
            }
            return [...prev, { productId: p.productId, name: p.name, price: p.price, amount: 1 }];
        });
    };

    const handleSubmit = async () => {
        if (total <= 0) {
            Swal.fire("결제 불가", "총 결제 금액이 0원보다 커야 합니다.", "warning");
            return;
        }

        const payload = {
            posId: 69, // 임의로 넣음
            dailySeq: 948732, // 임의로 넣음
            shopId: Number(shopId),
            cardCompanyId,
            cardNumber: cardNumber.replace(/\s/g, ""),
            last4: cardNumber.replace(/\D/g, "").slice(-4),
            items: items.map((it) => ({ productId: it.productId, amount: it.amount })),
            summary: { subtotal, discounts, total },
        };

        // 1) 승인중 모달 먼저 띄우기 (닫기 버튼 없음)
        await Swal.fire({
            title: "카드 승인중...",
            text: "잠시만 기다려주세요.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            timer: 1200, // 1.2초 뒤 자동 닫힘
            showConfirmButton: false,
        }).then(() => {
            createOfflinePay(payload)
                .then(() => {
                    Swal.fire({
                        icon: "success",
                        title: "결제 완료",
                        text: `총 ${total.toLocaleString()}원이 결제되었습니다.`,
                        confirmButtonText: "확인",
                        confirmButtonColor: "#10b981",
                        timer: 2000, // 2초 뒤 자동 닫힘
                    });
                    setItems([]);
                })
                .catch(() => {
                    Swal.fire({
                        icon: "error",
                        title: "결제 실패",
                        text: "결제 처리 중 오류가 발생했습니다.",
                        confirmButtonText: "확인",
                        confirmButtonColor: "#ef4444",
                    });
                });
        })

    };

    return (
        <div className="flex h-[90vh]">
            <div className="w-1/3 border-r flex flex-col">
                <OrderHeader
                    departmentStores={departmentStores}
                    shops={shops}
                    cardCompanies={cardCompanies}
                    shopId={shopId}
                    setShopId={setShopId}
                    cardCompanyId={cardCompanyId}
                    setCardCompanyId={setCardCompanyId}
                    cardNumber={cardNumber}
                    setCardNumber={setCardNumber}
                />
                <OrderItems items={items} setItems={setItems} />
                <OrderSummary subtotal={subtotal} discounts={discounts} total={total} onSubmit={handleSubmit} />
            </div>
            <ProductGrid products={products} addItem={addItem} />
        </div>
    );
};

export default OfflinePayCreate;