import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { Trash2, PlusCircle } from "lucide-react";

import { CardNumberInput } from "@/components/_custom/CustomInputs";

import { deleteMyCardInfo, fetchMyCardInfo, registerMyCardInfo } from "@/api/member_card/memberCard.api";
import { CustomCommonButton } from "@/components/_custom/CustomButtons";
import { useOutletContext } from "react-router-dom";
import Card from "@/components/card/Card";


const MyCardInfo = () => {
    const { setTitle } = useOutletContext();

    useEffect(() => {
        setTitle("내 카드 관리");
    }, [setTitle]);

    const [myCards, setMyCards] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [cardNumber, setCardNumber] = useState("");

    useEffect(() => {
        loadCards();
    }, []);

    // 내 카드 정보 가져오기
    const loadCards = () => {
        fetchMyCardInfo()
            .then(({ memberCardInfoList }) => {
                setMyCards(memberCardInfoList || []);
                console.log(memberCardInfoList);
            })
    }

    // 카드 등록
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cardNumber.length !== 16) {
            Swal.fire("카드번호 확인", "카드번호 16자리를 입력해주세요.", "warning");
            return;
        }

        registerMyCardInfo({ cardNumber })
            .then(() => {
                Swal.fire("등록 완료", "카드가 정상적으로 등록되었습니다.", "success");
                setCardNumber("");
                setShowForm(false);
                loadCards();
            }).catch((err) => {
                console.log(err);
                Swal.fire("에러", "카드 등록 중 오류가 발생했습니다.", "error");
            })
    };

    // 카드 삭제
    const handleDelete = async (memberCardId) => {
        Swal.fire({
            title: "정말 삭제하시겠습니까?",
            text: "삭제 후에는 복구할 수 없습니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33", // 빨강
            cancelButtonColor: "#3085d6", // 파랑
            confirmButtonText: "네, 삭제합니다",
            cancelButtonText: "취소"
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMyCardInfo(memberCardId)
                    .then(() => {
                        Swal.fire("삭제 완료", "카드가 삭제되었습니다.", "success");
                        loadCards();
                    }).catch(() => {
                        Swal.fire("에러", "카드 삭제 중 오류가 발생했습니다.", "error");
                    })
            }
        })

    };

    return (
        <>
            {/* 등록된 카드 리스트 */}
            <div className="space-y-4 pb-24">
                {myCards.map((card) => (
                    <Card
                        card={card}
                        bgImage="/assets/cards/the_hyundae_1.png"
                        onDelete={handleDelete}
                    />

                ))}
            </div>

            {/* 카드 등록 버튼 */}
            {/* {!showForm && ( */}
            <div className="fixed w-full max-w-xl bottom-0 left-1/2 -translate-x-1/2 p-4 bg-white border-t">
                <CustomCommonButton
                    onClick={() => setShowForm(true)}
                    children="+ 새 카드 등록"
                />
            </div>
            {/* )} */}

            {/* 카드 등록 폼 */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">새 카드 등록</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">카드번호</label>
                                <CardNumberInput value={cardNumber} onChange={setCardNumber} />
                            </div>

                            <div className="flex gap-2">
                                <CustomCommonButton
                                    type="submit"
                                    children="등록"
                                    className="flex-1"
                                />
                                <CustomCommonButton
                                    onClick={() => setShowForm(false)}
                                    children="취소"
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 !text-black"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};





export default MyCardInfo;