// RaffleListPage.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getRaffleList } from "@/api/raffleList/raffleList.api";
import { getMemberStockInfoAll } from "@/api/memberStockInfoAll/memberStockInfoAll.api";
import RaffleCard from "@/components/raffle/RaffleCard";
import useAuthStore from "@/store/authStore";

const SkeletonCard = () => (
  <div className="relative rounded-3xl shadow-xl border bg-white border-gray-200 overflow-hidden">
    <div className="p-6 pb-0">
      <div className="w-full h-64 rounded-2xl bg-gray-100 animate-pulse" />
      <div className="absolute top-4 right-4 w-20 h-7 rounded-full bg-gray-200 animate-pulse" />
    </div>
    <div className="p-6 space-y-4">
      <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
      <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
    </div>
  </div>
);

const EmptyState = ({ onRefresh }) => (
  <div className="max-w-xl mx-auto text-center bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
      <span className="text-white text-2xl">🎁</span>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">현재 진행 중인 래플이 없어요</h2>
    <p className="text-gray-600">
      새로운 친환경 래플을 준비 중입니다. 잠시만 기다려 주세요!
    </p>
    <button
      onClick={onRefresh}
      className="mt-6 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow"
    >
      새로고침
    </button>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="max-w-xl mx-auto">
    <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-center">
      <div className="text-2xl mb-2">⚠️</div>
      <h3 className="text-lg font-bold text-red-800 mb-1">데이터를 불러오지 못했어요</h3>
      <p className="text-sm text-red-700">{message || "잠시 후 다시 시도해 주세요."}</p>
      <div className="mt-4 flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
        >
          다시 시도
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-100 font-semibold"
        >
          새로고침
        </button>
      </div>
    </div>
  </div>
);

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

  // fetchData를 밖으로 빼서 재시도/새로고침 버튼에서 재사용
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

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
  }, [loginStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- 상태별 UI ----
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-4xl mx-auto px-4 py-10">
          {/* 상단 헤더 */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🎁</span>
              </div>
              <h1 className="text-3xl font-bold text-green-600">래플 이벤트</h1>
            </div>
            <p className="text-gray-600 text-lg">불러오는 중입니다...</p>
            <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mt-3" />
          </div>

          {/* 스켈레톤 목록 */}
          <div className="grid grid-cols-1 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-start">
        <main className="max-w-4xl mx-auto px-4 py-10 w-full">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🎁</span>
              </div>
              <h1 className="text-3xl font-bold text-green-600">래플 이벤트</h1>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mt-3" />
          </div>

          <ErrorState message={error} onRetry={fetchData} />
        </main>
      </div>
    );
  }

  if (raffleList.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🎁</span>
              </div>
              <h1 className="text-3xl font-bold text-green-600">래플 이벤트</h1>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mt-3" />
          </div>

          <EmptyState onRefresh={fetchData} />
        </main>
      </div>
    );
  }

  // 기본 리스트
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="max-w-4xl mx-auto px-4 flex-1 py-6">
        {/* 상단 헤더 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎁</span>
            </div>
            <h1 className="text-3xl font-bold text-green-600">래플 이벤트</h1>
          </div>
          <p className="text-gray-600 text-lg">✨ 친환경 제품을 무료로 받아보세요! ✨</p>
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
