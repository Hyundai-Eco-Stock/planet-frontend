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
    const [cardNumber, setCardNumber] = useState("1234123412341234");
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
            posId: 69,
            dailySeq: 948732,
            shopId: Number(shopId),
            cardCompanyId,
            cardNumber: cardNumber.replace(/\s/g, ""),
            last4: cardNumber.replace(/\D/g, "").slice(-4),
            items: items.map((it) => ({ productId: it.productId, amount: it.amount })),
            summary: { subtotal, discounts, total },
        };

        try {
            await createOfflinePay(payload);
            Swal.fire("결제 완료", `총 ${total.toLocaleString()}원이 결제되었습니다.`, "success");
            setItems([]);
        } catch {
            Swal.fire("결제 실패", "결제 처리 중 오류가 발생했습니다.", "error");
        }
    };

    return (
        <div className="flex h-full">
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