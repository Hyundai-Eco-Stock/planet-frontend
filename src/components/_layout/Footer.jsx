import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@/assets/navigation_icon/Home.svg';
import ShoppingIcon from '@/assets/navigation_icon/Shopping2.svg';
import EcoIcon from '@/assets/navigation_icon/Eco.svg';
import UserIcon from '@/assets/navigation_icon/User.svg';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menus = [
        { name: "홈", icon: HomeIcon, path: "/home/main" },
        { name: "쇼핑", icon: ShoppingIcon, path: "/shopping/main" },
        { name: "에코스톡", icon: EcoIcon, path: "/eco-stock/main" },
        { name: "마이", icon: UserIcon, path: "/my-page/main" },
    ];

    const handleMenuClick = (menu) => {
        navigate(menu.path);
    };

    return (
        <div className="flex w-full justify-between h-full items-center">
            {menus.map((menu) => {
                const isActive = location.pathname.startsWith(menu.path);

                return (
                    <button
                        className="flex-1 flex flex-col items-center justify-center cursor-pointer py-2"
                        onClick={() => handleMenuClick(menu)}
                        key={menu.name}
                    >
                        <img
                            src={menu.icon}
                            className="w-6 h-6 mb-1 transition-all duration-200"
                            style={{
                                filter: isActive 
                                    ? 'brightness(0) saturate(100%) invert(44%) sepia(78%) saturate(2476%) hue-rotate(141deg) brightness(97%) contrast(86%)'
                                    : 'brightness(0) saturate(100%) invert(7%) sepia(7%) saturate(1065%) hue-rotate(202deg) brightness(99%) contrast(88%)'
                            }}
                        />
                        <span
                            className={`transition-all duration-200 font-normal ${
                                isActive ? "text-eco" : "text-primary"
                            }`}
                            style={{ fontSize: '10px' }}
                        >
                            {menu.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default Footer;