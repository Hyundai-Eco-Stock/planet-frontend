// RaffleListPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRaffleList } from "@/api/raffleList/raffleList.api";
import { getMemberStockInfoAll } from "@/api/memberStockInfoAll/memberStockInfoAll.api";
import RaffleCard from "@/components/raffle/RaffleCard";

const RaffleListPage = () => {
  const [raffleList, setRaffleList] = useState([]); // []로 시작
  const [personalStockInfoList, setPersonalStockInfoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // 문자열로 단순화

  const navigate = useNavigate();

  const handleButtonClick = useCallback(
    (item, e) => {
      e.stopPropagation(); // 카드 클릭 막기
      navigate(`/raffle/detail/${item.raffleId}`, {
        state: {
          personalStockInfoList,
          winnerName: item.winnerName
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

        // 두 API를 병렬 호출
        const [raffleResponse, stockResponse] = await Promise.all([
          getRaffleList(),
          getMemberStockInfoAll(),
        ]);

        setRaffleList(raffleResponse || []);
        setPersonalStockInfoList(stockResponse || []);
      } catch (err) {
        console.error("데이터 조회 실패:", err);
        setError("데이터 조회에 실패했어요 😢");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
