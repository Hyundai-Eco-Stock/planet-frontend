import { Trash2 } from "lucide-react";

import CardImage1 from '@/assets/hyundae_department_card/the_hyundae_1.png'
import CardImage2 from '@/assets/hyundae_department_card/the_hyundae_2.png'
import CardImage3 from '@/assets/hyundae_department_card/the_hyundae_fit.png'

const Card = ({ card, onDelete }) => {
    // 카드번호 마스킹
    const maskCardNumber = (num) => num.replace(/\d(?=\d{4})/g, "•");

    const cardImageList = [CardImage1, CardImage2, CardImage3];

    // 임의로 카드 이미지 매칭하는 함수
    const pickCardDesign = (cardNumber) => {
        const index = (cardNumber % 10) % 3;
        return cardImageList[index];
    }

    return (
        <div className="relative w-full aspect-[1.585/1] rounded-2xl shadow-lg overflow-hidden">
            {/* 카드 배경 이미지 */}
            <img
                src={pickCardDesign(card.cardNumber)}
                alt="Card background"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* 오버레이 */}
            <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                {/* 상단: 카드사 이름 + 삭제 버튼 */}
                <div className="flex justify-between items-start">
                    <span className="text-lg font-semibold">현대백화점 카드</span>
                    <button onClick={() => onDelete(card.memberCardId)} className="hover:text-red-300">
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* 하단: 카드번호 */}
                <div className="text-xl tracking-widest font-mono">
                    {maskCardNumber(card.cardNumber)}
                </div>
            </div>
        </div>
    );
};

export default Card;