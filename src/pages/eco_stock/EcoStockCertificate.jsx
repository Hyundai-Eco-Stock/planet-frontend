import { useNavigate } from "react-router-dom";

const EcoStockCertificate = () => {

    const ecoStockCertificateList = [
        { name: '텀블러 인증', path: '/eco-stock/certificate/tumbler' },
        { name: '전기차 주차 인증', path: '/eco-stock/certificate/electronic-car-parking' },
        { name: '종이백 미사용 인증', path: '/eco-stock/certificate/paper-bag-no-use' },
    ]

    return (
        <div className="text-center">
            <div className="text-2xl mt-10 mb-10">에코 스톡 인증</div>
            {
                ecoStockCertificateList.map((certificate) =>
                    <Component key={certificate.name} {...certificate} />
                )
            }
        </div>
    );
}

const Component = ({ name, path }) => {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(path);
    }

    return (
        <button
            onClick={handleClick}
            className="
                w-full h-[3.5rem]
                bg-green-300 hover:bg-green-400 
                text-black font-medium 
                rounded-xl border transition"
        >
            {name}
        </button>
    )
}

export default EcoStockCertificate;