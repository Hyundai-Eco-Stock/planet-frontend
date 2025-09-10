// RaffleListPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRaffleList } from "@/api/raffleList/raffleList.api";
import { getMemberStockInfoAll } from "@/api/memberStockInfoAll/memberStockInfoAll.api";
import RaffleCard from "@/components/raffle/RaffleCard";
import useAuthStore from "@/store/authStore";
import heendyRaffle from '@/assets/heendy-raffle.png'

const RaffleListPage = () => {
  const [raffleList, setRaffleList] = useState([]);
  const [personalStockInfoList, setPersonalStockInfoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState('all');
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

  const now = new Date();
  const activeRaffles = raffleList.filter(r => {
    if (r.winnerName) return false;
    const endDateTime = new Date(r.endDate + ' 23:59:59');
    return now <= endDateTime;
  });
  const endedRaffles = raffleList.filter(r => {
    if (r.winnerName) return true;
    const endDateTime = new Date(r.endDate + ' 23:59:59');
    return now > endDateTime;
  });

  // 필터링된 래플
  const filteredRaffles = filter === 'active' ? activeRaffles : filter === 'ended' ? endedRaffles : raffleList;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-gray-500">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        불러오는 중...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-red-500 font-medium">{error}</div>
      </div>
    </div>
  );

  if (raffleList.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <img
                src={heendyRaffle}
                alt="흰디 래플"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-2">진행 중인 래플이 없습니다</div>
            <div className="text-gray-500">새로운 래플을 기다려주세요</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* 상단 헤더 배너 */}
      <div className="absolute top-0 left-0 right-0 -mx-4">
        <div className="bg-gradient-to-b from-orange-200/40 via-orange-100/20 to-transparent px-6 py-8 h-48">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">래플 응모하기</h1>
            <p className="text-gray-600 mb-6">에코스톡으로 무료 응모 가능!</p>

            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-sm"></div>
                <span className="text-gray-700 font-medium">진행중 <span className="font-bold text-orange-600">{activeRaffles.length}개</span></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-400 rounded-full shadow-sm"></div>
                <span className="text-gray-700 font-medium">종료 <span className="font-bold text-gray-500">{endedRaffles.length}개</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 px-4 pb-20 pt-56">
        {/* 필터 버튼 */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`py-3 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            전체 {raffleList.length}개
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`py-3 rounded-lg text-sm font-medium transition-colors ${filter === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            진행중 {activeRaffles.length}개
          </button>
          <button
            onClick={() => setFilter('ended')}
            className={`py-3 rounded-lg text-sm font-medium transition-colors ${filter === 'ended' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            종료 {endedRaffles.length}개
          </button>
        </div>

        {/* 래플 목록 */}
        <div className="space-y-6">
          {filteredRaffles.map((item) => (
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