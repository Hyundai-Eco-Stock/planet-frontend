import { CustomSelect } from "@/components/_custom/CustomSelect";
import { CardNumberInput } from "@/components/_custom/CustomInputs";

const OrderHeader = ({
    departmentStores,
    shops,
    cardCompanies,
    shopId,
    setShopId,
    cardCompanyId,
    setCardCompanyId,
    cardNumber,
    setCardNumber,
}) => {
    return (
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
    );
};

export default OrderHeader;