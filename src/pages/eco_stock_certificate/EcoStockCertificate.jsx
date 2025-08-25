import { useNavigate } from "react-router-dom";
import { CustomCommonButton } from "../../components/_custom/CustomButtons";

const EcoStockCertificate = () => {

    const ecoStockCertificateList = [
        { name: '텀블러 인증', path: '/eco-stock/certificate/tumbler' },
        { name: '종이백 미사용 인증', path: '/eco-stock/certificate/paper-bag-no-use' },
        // { name: '전기차 주차 인증', path: '/eco-stock/certificate/electronic-car-parking' },
    ]

    return (
        <div className="text-center">
            <div className="text-2xl mt-10 mb-10">에코 스톡 인증</div>
            <div className="flex flex-col gap-1">
                {
                    ecoStockCertificateList.map((certificate) =>
                        <Component key={certificate.name} {...certificate} />
                    )
                }
            </div>
        </div>
    );
}

const Component = ({ name, path }) => {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(path);
    }

    return (
        <CustomCommonButton
            onClick={handleClick}
            children={name} />
    )
}

export default EcoStockCertificate;