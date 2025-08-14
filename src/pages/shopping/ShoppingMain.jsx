import { searchTodayAllEcoDealProducts } from "../../api/product/ecoProduct.api";

const ShoppingMain = () => {

    const handleEcoDealProducts = () => {
        const res = searchTodayAllEcoDealProducts();
        console.log(res);
    }

    return (
        <div>
            <h2>쇼핑 메인</h2>
            <button onClick={handleEcoDealProducts}>
                에코딜 상품 가져오기
            </button>
        </div>
    );
}

export default ShoppingMain;