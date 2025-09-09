// import { useNavigate, useOutletContext } from "react-router-dom";
// import { CustomCommonButton } from "../../components/_custom/CustomButtons";
// import { useEffect } from "react";

// const EcoStockCertificate = () => {

//     const { setTitle } = useOutletContext();

//     useEffect(() => {
//         setTitle("오프라인 활동 인증");
//     }, [setTitle]);


//     const ecoStockCertificateList = [
//         { name: '텀블러 사용 인증', path: '/eco-stock/certificate/tumbler' },
//         { name: '종이백 미사용 인증', path: '/eco-stock/certificate/paper-bag-no-use' },
//     ]

//     return (
//         <div className="flex flex-col mt-6 gap-6">
//             {
//                 ecoStockCertificateList.map((certificate) =>
//                     <Component key={certificate.name} {...certificate} />
//                 )
//             }
//         </div>
//     );
// }

// const Component = ({ name, path }) => {

//     const navigate = useNavigate();

//     const handleClick = () => {
//         navigate(path);
//     }

//     return (
//         <CustomCommonButton
//             onClick={handleClick}
//             children={name} />
//     )
// }

// export default EcoStockCertificate;