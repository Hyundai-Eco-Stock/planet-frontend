// RaffleDetailPage.js
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CountdownTimer from "@/components/raffle/CountdownTimer";
import { getRaffleDetail } from "@/api/raffleDetail/raffleDetail.api";
import { raffleParticipate } from "@/api/raffleParticipate/raffleParticipate.api";
import { getMemberStockInfoAll } from "@/api/memberStockInfoAll/memberStockInfoAll.api";
import { getRaffleEntryStatus } from "@/api/raffleEntryStatus/raffleEntryStatus.api";
import useAuthStore from "@/store/authStore";

const RaffleDetailPage = () => {
  const { raffleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const winnerName = location.state?.winnerName;
  const raffleItem = location.state?.raffleItem;
  const { loginStatus } = useAuthStore.getState();
  const [personalStockInfoList, setPersonalStockInfoList] = useState([]);
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participateLoading, setParticipateLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryStatus, setEntryStatus] = useState(false);

  // 모달 상태 관리
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');

  // 컴포넌트 마운트 시 푸터 숨기기, 언마운트 시 다시 보이기
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }

    return () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'block';
      }
    };
  }, []);

  useEffect(() => {
    const fetchPersonalStockInfo = async () => {
      if (!loginStatus) {
        setPersonalStockInfoList([]);
        return;
      }
      try {
        const stockData = await getMemberStockInfoAll();
        setPersonalStockInfoList(stockData || []);
      } catch (err) {
        console.error("개인 에코스톡 정보 조회 실패:", err);
        setPersonalStockInfoList([]);
      }
    };

    fetchPersonalStockInfo();
  }, [loginStatus]);

  useEffect(() => {
    const fetchRaffleEntryStatus = async () => {
      if (!loginStatus) {
        setEntryStatus(false);
        return;
      }
      try {
        const entryStatus = await getRaffleEntryStatus(raffleId);
        if (entryStatus.status === true) {
          setEntryStatus(true);
        }
      } catch (err) {
        console.error("개인 응모 내역 조회:", err);
      }
    };

    fetchRaffleEntryStatus();
  }, [raffleId]);

  // 에코스톡 보유량 확인 함수
  const getUserStock = (ecoStockName) => {
    return personalStockInfoList.find(stock => stock.ecoStockName === ecoStockName);
  };

  // 래플 응모 가능 여부 확인
  const userStock = raffle ? getUserStock(raffle.ecoStockName) : null;
  const hasEnoughStock = userStock && userStock.currentTotalQuantity >= raffle?.ecoStockAmount;
  const currentQuantity = userStock ? userStock.currentTotalQuantity : 0;

  // 에코스톡 수량 업데이트 함수
  const updatePersonalStockInfo = (ecoStockId, remainingQuantity) => {
    setPersonalStockInfoList(prevList =>
      prevList.map(stock =>
        stock.ecoStockId === ecoStockId
          ? { ...stock, currentTotalQuantity: remainingQuantity }
          : stock
      )
    );
  };

  // 래플 상태 확인
  const isRaffleActive = () => {
    if (!raffle?.endDate) return false;
    const now = new Date();
    const endDate = new Date(raffle.endDate);
    endDate.setHours(23, 59, 59, 999);
    return endDate > now && !winnerName;
  };

  // 모달 컴포넌트들
  const EntryModal = () => (
    showEntryModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h3 className="text-lg font-bold text-white text-center">래플 응모 조건</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">1인 1회 응모 가능</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">당첨 시 본인 확인 필요</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">배송비 무료</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">응모 취소 불가</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl mb-6 border border-orange-100">
              <div className="text-center">
                <p className="text-gray-700 font-medium text-sm">
                  {raffle.ecoStockName} 에코스톡 {raffle.ecoStockAmount}개 필요
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  보유: {currentQuantity}개 / 필요: {raffle.ecoStockAmount}개
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEntryModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowEntryModal(false);
                  handleConfirmEntry();
                }}
                className="flex-1 py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 shadow-lg"
              >
                응모하기
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const SuccessModal = () => (
    showSuccessModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h3 className="text-lg font-bold text-white text-center">응모 완료</h3>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">래플 참여가 완료되었습니다</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )
  );

  const ErrorModal = () => (
    showErrorModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
            <h3 className="text-lg font-bold text-white text-center">{errorTitle}</h3>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )
  );

  const showErrorPopup = (error) => {
    let title = '응모 실패';
    let message = '응모 처리 중 오류가 발생했습니다.';

    if (error.response?.data) {
      const { errorCode, message: errorMessage } = error.response.data;

      switch (errorCode) {
        case 'RAFFLE_NOT_FOUND':
          title = '래플 없음';
          break;
        case 'DUPLICATE_PARTICIPATION':
          title = '중복 응모';
          break;
        case 'INSUFFICIENT_STOCK':
          title = '에코스톡 부족';
          break;
        case 'RAFFLE_SYSTEM_ERROR':
          title = '시스템 오류';
          break;
      }
      message = errorMessage || message;
    }

    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  useEffect(() => {
    const fetchRaffleDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getRaffleDetail(raffleId);
        const raffleData = Array.isArray(data) ? data[0] : data;
        setRaffle(raffleData);
      } catch (err) {
        console.error("Raffle 조회 실패:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (raffleId) {
      fetchRaffleDetail();
    }
  }, [raffleId]);

  const handleEnterRaffle = () => {
    setShowEntryModal(true);
  };

  const handleConfirmEntry = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setParticipateLoading(true);

      const result = await raffleParticipate(raffleId);

      if (result && result.result === 1 && result.remainingQuantity !== undefined && result.ecoStockId) {
        updatePersonalStockInfo(result.ecoStockId, result.remainingQuantity);
        setEntryStatus(true);
        setShowSuccessModal(true);
      } else {
        setEntryStatus(true);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("래플 참여 실패:", error);
      showErrorPopup(error);
    } finally {
      setIsSubmitting(false);
      setParticipateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            {error?.message || "래플 데이터를 불러오지 못했습니다."}
          </p>
          <button
            onClick={() => navigate("/raffle")}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-xl mx-auto">
      {participateLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-700">처리 중...</p>
            </div>
          </div>
        </div>
      )}

      {/* 상품 이미지 */}
      <div className="relative bg-gray-50 -mx-4">
        <div className="aspect-square overflow-hidden">
          <img
            src={raffleItem?.imageUrl || raffle.imageUrl}
            alt={raffle.productName}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.target.src === raffleItem?.imageUrl && raffle.imageUrl) {
                e.target.src = raffle.imageUrl;
              } else {
                e.target.src = '/placeholder-image.jpg';
              }
            }}
          />
        </div>

        {/* 상태 배지 */}
        <div className="absolute top-4 left-4">
          {isRaffleActive() ? (
            <div className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              진행 중
            </div>
          ) : (
            <div className="bg-gray-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
              종료
            </div>
          )}
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="px-4 py-6 pb-24">
        {/* 브랜드 및 상품명 */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-2">{raffle.brandName}</p>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{raffle.productName}</h1>
          <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
        </div>

        {/* 가격 정보 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 line-through text-lg">
              {raffle.price?.toLocaleString()}원
            </span>
            <span className="text-red-500 font-bold text-lg">100%</span>
          </div>
          <span className="text-3xl font-bold text-black">0원</span>
        </div>

        {/* 카운트다운 타이머 */}
        <div className="mb-6">
          <CountdownTimer
            endDate={raffle.endDate}
            large={true}
            isActive={isRaffleActive()}
          />
        </div>

        {/* 래플 기간 정보 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">래플 일정</h3>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="w-16 text-gray-600">응모기간</span>
              <span className="text-gray-900">
                {new Date(raffle.startDate).toLocaleDateString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric'
                })} ({new Date(raffle.startDate).toLocaleDateString('ko-KR', { weekday: 'short' }).slice(0, 1)}) 11:00 ~ {new Date(raffle.endDate).toLocaleDateString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric'
                })} ({new Date(raffle.endDate).toLocaleDateString('ko-KR', { weekday: 'short' }).slice(0, 1)}) 23:59
              </span>
            </div>
            <div className="flex">
              <span className="w-16 text-gray-600">당첨발표</span>
              <span className="text-gray-900">
                {new Date(raffle.endDate).toLocaleDateString('ko-KR', {
                  month: 'numeric',
                  day: 'numeric'
                })} ({new Date(raffle.endDate).toLocaleDateString('ko-KR', { weekday: 'short' }).slice(0, 1)}) 다음날 12:00
              </span>
            </div>
          </div>
        </div>

        {/* 응모 조건 */}
        {!winnerName && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">에코스톡 응모 조건</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">필요한 에코스톡</span>
                <span className="font-medium text-gray-900">{raffle.ecoStockName} {raffle.ecoStockAmount}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">보유 중인 수량</span>
                <span className={`font-medium ${hasEnoughStock ? 'text-green-600' : 'text-red-600'}`}>
                  {currentQuantity}개
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">응모 가능 여부</span>
                <span className={`font-medium ${entryStatus
                    ? 'text-orange-600'
                    : hasEnoughStock
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  {entryStatus
                    ? '응모 완료'
                    : hasEnoughStock
                      ? '응모 가능'
                      : '에코스톡 부족'
                  }
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 상세 이미지 */}
        {raffle.images && raffle.images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">상품 상세</h3>
            <div className="space-y-4">
              {raffle.images
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((image, index) => (
                  <img
                    key={image.imageId || index}
                    src={image.imageUrl}
                    alt={image.altText || `상품 상세 이미지 ${index + 1}`}
                    className="w-full rounded-xl shadow-sm"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border-t border-gray-200 z-50" style={{ height: '85px' }}>
        <div className="px-4 pt-3 pb-6 h-full flex items-start">
          <button
            onClick={
              winnerName
                ? undefined
                : !hasEnoughStock && isRaffleActive() && !entryStatus
                  ? () => navigate('/eco-stock/main')
                  : handleEnterRaffle
            }
            disabled={isSubmitting || entryStatus || winnerName || (!hasEnoughStock && !isRaffleActive())}
            className={`w-full py-3 rounded-lg font-medium text-base transition-all duration-200 border ${isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
              : entryStatus
                ? 'bg-gray-100 text-gray-600 border-black cursor-not-allowed' // 검정 테두리 + 회색 내부
                : winnerName
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                  : !isRaffleActive()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                    : hasEnoughStock
                      ? 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 border-black'
                      : 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 border-black'
              }`}
          >
            {isSubmitting
              ? '응모 중...'
              : winnerName
                ? '래플 종료'
                : entryStatus
                  ? '참여 완료'
                  : !isRaffleActive()
                    ? '응모 마감'
                    : hasEnoughStock
                      ? '래플 응모하기'
                      : `에코스톡 부족 · ${raffle.ecoStockName} ${raffle.ecoStockAmount}개 필요`
            }
          </button>
        </div>
      </div>

      {/* 모달들 */}
      <EntryModal />
      <SuccessModal />
      <ErrorModal />
    </div>
  );
};

export default RaffleDetailPage;