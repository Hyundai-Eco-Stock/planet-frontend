// RaffleListPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRaffleList } from "@/api/raffleList/raffleList.api";
import { getMemberStockInfoAll } from "@/api/memberStockInfoAll/memberStockInfoAll.api";
import RaffleCard from "@/components/raffle/RaffleCard";
import useAuthStore from "@/store/authStore";

const RaffleListPage = () => {
  const [raffleList, setRaffleList] = useState([]); // []로 시작
  const [personalStockInfoList, setPersonalStockInfoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // 문자열로 단순화
  const { loginStatus } = useAuthStore.getState();
  const navigate = useNavigate();

  const handleButtonClick = useCallback(
    (item, e) => {
      e.stopPropagation(); // 카드 클릭 막기
      navigate(`/raffle/detail/${item.raffleId}`, {
        state: {
          personalStockInfoList,
          winnerName: item.winnerName,
          raffleItem: item
        },
      });
    },
    [navigate, personalStockInfoList]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // 래플 목록은 항상 가져오고, 개인 스톡 정보는 로그인 시에만 가져옴
        const raffleResponse = await getRaffleList();
        setRaffleList(raffleResponse || []);

        if (loginStatus) {
          const stockResponse = await getMemberStockInfoAll();
          setPersonalStockInfoList(stockResponse || []);
        } else {
          setPersonalStockInfoList([]); // 미로그인 시 빈 배열
        }
      } catch (err) {
        console.error("데이터 조회 실패:", err);
        setError("데이터 조회에 실패했어요");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loginStatus]); // loginStatus를 의존성으로 추가

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div>{error}</div>;
  if (raffleList.length === 0) {
    return <div>현재 래플 중인 데이터가 없습니다</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-4 py-6">
        {/* 상단 헤더 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎁</span>
            </div>
            <h1 className="text-3xl font-bold text-green-600">래플 이벤트</h1>
          </div>
          <p className="text-gray-600 text-lg">
            ✨ 친환경 제품을 무료로 받아보세요! ✨
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mt-3"></div>
        </div>

        {/* 래플 목록 */}
        <div className="grid grid-cols-1 gap-6">
          {raffleList.map((item) => (
            <RaffleCard
              key={item.raffleId}
              item={item}
              personalStockInfoList={personalStockInfoList}
              onButtonClick={(e) => handleButtonClick(item, e)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default RaffleListPage;
