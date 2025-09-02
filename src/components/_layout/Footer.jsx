import { useNavigate } from 'react-router-dom';

import Hamburger from '@/assets/navigation_icon/Hamburger.svg';
import House from '@/assets/navigation_icon/House.svg';
import My from '@/assets/navigation_icon/My.svg';
import Planet from '@/assets/navigation_icon/Planet.svg';

const Footer = () => {

    const navigate = useNavigate();

    const menus = [
        { name: "쇼핑", icon: Hamburger, path: "/shopping/main" },
        { name: "에코스톡", icon: Planet, path: "/eco-stock/main" },
        { name: "홈", icon: House, path: "/home/main" },
        // { name: "에코딜", icon: Planet, path: "/eco-deal/main" },
        { name: "마이", icon: My, path: "/my-page/main" },
    ]

    const handleMenuClick = (menu) => {
        navigate(menu.path);
    }

    return (
        <div className="flex w-full justify-between h-full">
            {
                menus.map((menu) => {
                    return <button
                        className="flex-1 flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => handleMenuClick(menu)}
                        key={menu.name}
                    >
                        <img src={menu.icon} className="w-6 h-6 mb-1"/>
                        <span className='text-sm font-semibold text-gray-900'>{menu.name}</span>
                    </button>
                })
            }
        </div>
    )
}

export default Footer;