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
                                // 모든 아이콘을 검정색으로 통일
                                filter: 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
                            }}
                        />
                        <span
                            className="transition-all duration-200 text-black"
                            style={{ 
                                fontSize: '10px',
                                fontWeight: isActive ? '600' : '400' // 활성상태는 굵게만
                            }}
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