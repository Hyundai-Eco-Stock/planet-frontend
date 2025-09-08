import { useNavigate } from "react-router-dom";

const EcoStockCertificate = () => {
    const ecoStockCertificateList = [
        { 
            name: '텀블러 사용 인증', 
            path: '/eco-stock/certificate/tumbler',
            emoji: '🥤',
            description: '개인 텀블러를 사용한 모습을 인증해보세요'
        },
        { 
            name: '종이백 미사용 인증', 
            path: '/eco-stock/certificate/paper-bag-no-use',
            emoji: '🛍️',
            description: '장바구니나 에코백을 사용한 모습을 인증해보세요'
        },
    ]

    return (
        <div className="flex flex-col mt-6 gap-4">
            {
                ecoStockCertificateList.map((certificate) =>
                    <CertificateCard key={certificate.name} {...certificate} />
                )
            }
        </div>
    );
}

const CertificateCard = ({ name, path, emoji, description }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(path);
    }

    return (
        <div 
            onClick={handleClick}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-green-200 active:scale-[0.98]"
        >
            <div className="flex items-center gap-4">
                <div className="text-3xl flex-shrink-0">
                    {emoji}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className="text-gray-400 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default EcoStockCertificate;