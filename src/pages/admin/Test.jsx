
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { searchRecommendProducts } from "@/api/product/product.api";
import { searchTodayAllEcoDealProducts } from "@/api/product/ecoProduct.api";
import { useNavigate } from "react-router-dom";


const Test = () => {

    const navigate = useNavigate();

    const handleEcoDealProducts = () => {
        const res = searchTodayAllEcoDealProducts();
        console.log(res);
    }

    const handleProductRecommend = () => {
        const products = searchRecommendProducts(
            "스트래피 실크 탑", 1, 32, 5
        );
        console.log(products);
    }

    return (
        <div>
            <CustomCommonButton onClick={handleProductRecommend} children="상품 추천" />
            <CustomCommonButton onClick={handleEcoDealProducts} children="에코딜 상품 가져오기" />
            <CustomCommonButton onClick={() => { navigate("/offline-pay/create") }} children="오프라인 결제 포스기" />
            <CustomCommonButton onClick={() => { navigate("/car-access-history/create") }} children="차량 입출차 시스템" />
            <CustomCommonButton onClick={() => { navigate("/admin/dashboard/eco-stock") }} children="에코스톡 대시보드 페이지" />
        </div>
    )
}

export default Test;