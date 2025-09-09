
import { testNotification } from "@/api/admin/admin.api";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { useNavigate } from "react-router-dom";


const AdminHome = () => {

    const navigate = useNavigate();

    return (
        <div className="pt-28 space-y-8">
            <CustomCommonButton onClick={() => { navigate("/offline-pay/create") }} children="오프라인 결제 포스기 관리" />
            <CustomCommonButton onClick={() => { navigate("/car-access-history/create") }} children="차량 입출차 시스템 관리" />
            <CustomCommonButton onClick={() => { navigate("/admin/dashboard/main") }} children="통계 대시보드" />
            <CustomCommonButton onClick={() => { testNotification() }} children="알림 테스트" />
        </div>
    )
}

export default AdminHome;