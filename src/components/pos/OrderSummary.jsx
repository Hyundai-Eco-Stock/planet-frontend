import { CustomCommonButton } from "@/components/_custom/CustomButtons";

const OrderSummary = ({ subtotal, discounts, total, onSubmit }) => {
    return (
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
                onClick={onSubmit}
                disabled={total <= 0}
            >
                결제하기
            </CustomCommonButton>
        </div>
    );
};

export default OrderSummary;