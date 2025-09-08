// RaffleListPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRaffleList } from "@/api/raffleList/raffleList.api";
import { getMemberStockInfoAll } from "@/api/memberStockInfoAll/memberStockInfoAll.api";
import RaffleCard from "@/components/raffle/RaffleCard";
import useAuthStore from "@/store/authStore";

const RaffleListPage = () => {
  const [raffleList, setRaffleList] = useState([]);
  const [personalStockInfoList, setPersonalStockInfoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { loginStatus } = useAuthStore.getState();
  const navigate = useNavigate();

  const handleButtonClick = useCallback(
    (item, e) => {
      e.stopPropagation();
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

        const raffleResponse = await getRaffleList();
        setRaffleList(raffleResponse || []);

        if (loginStatus) {
          const stockResponse = await getMemberStockInfoAll();
          setPersonalStockInfoList(stockResponse || []);
        } else {
          setPersonalStockInfoList([]);
        }
      } catch (err) {
        console.error("데이터 조회 실패:", err);
        setError("데이터 조회에 실패했어요");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loginStatus]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-gray-500">불러오는 중...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-red-500">{error}</div>
    </div>
  );

  if (raffleList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-gray-400 text-center">
          <div className="text-lg mb-2">진행중인 래플이 없습니다</div>
          <div className="text-sm">새로운 래플을 기다려주세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="pb-20">
        {/* 상단 헤더 */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">래플 응모하기</h2>
            <p className="text-sm text-gray-500">
              진행중 {raffleList.filter(r => !r.winnerName).length}개
            </p>
          </div>
        </div>
        
        {/* 구분선 */}
        <div className="-mx-4 border-b border-gray-200"></div>

        {/* 래플 목록 */}
        <div className="-mx-4 space-y-6">
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