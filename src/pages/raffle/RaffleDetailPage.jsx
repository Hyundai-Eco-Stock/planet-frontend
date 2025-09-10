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
    // 푸터 숨기기
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }

    // 컴포넌트 언마운트 시 푸터 다시 보이기
    return () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'block';
      }
    };
  }, []);

  // personalStockInfoList를 API로 가져오는 useEffect 추가
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
          console.log(entryStatus);
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

  // 모달 컴포넌트들
  const EntryModal = () => (
    showEntryModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
        <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">래플 응모 조건</h3>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 text-sm">1인 1회 응모 가능</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 text-sm">당첨 시 본인 확인 필요</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 text-sm">배송비 무료</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-gray-700 text-sm">응모 취소 불가</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="text-center">
              <p className="text-gray-700 font-medium text-sm">
                {raffle.ecoStockName} 에코스톡 {raffle.ecoStockAmount}개 필요
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEntryModal(false)}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => {
                setShowEntryModal(false);
                handleConfirmEntry();
              }}
              className="flex-1 py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              응모하기
            </button>
          </div>
        </div>
      </div>
    )
  );

  const SuccessModal = () => (
    showSuccessModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
        <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">응모 완료</h3>
            <p className="text-gray-600 mb-6">래플 참여가 완료되었습니다</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
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
        <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{errorTitle}</h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )
  );

  const showErrorPopup = (error) => {
    console.log('전체 에러 객체:', error);
    console.log('에러 응답 데이터:', error.response?.data);
    console.log('에러 응답 상태:', error.response?.status);

    let title = '응모 실패';
    let message = '응모 처리 중 오류가 발생했습니다.';

    if (error.response?.data) {
      const { errorCode, message: errorMessage } = error.response.data;
      console.log('errorCode:', errorCode);
      console.log('errorMessage:', errorMessage);

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

  // raffleId 바뀔 때마다 API 호출
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
    console.log('handleConfirmEntry 시작');

    if (isSubmitting) {
      console.log('이미 처리 중이라 리턴');
      return;
    }

    console.log('try 블록 진입');
    try {
      setIsSubmitting(true);
      setParticipateLoading(true);
      console.log('상태 설정 완료');

      console.log('raffleParticipate 호출 전, raffleId:', raffleId);
      const result = await raffleParticipate(raffleId);
      console.log('raffleParticipate 성공, 결과:', result);

      // 성공 시 에코스톡 수량 업데이트
      if (result && result.result === 1 && result.remainingQuantity !== undefined && result.ecoStockId) {
        updatePersonalStockInfo(result.ecoStockId, result.remainingQuantity);

        // 응모 성공 시 entryStatus를 true로 설정
        setEntryStatus(true);

        setShowSuccessModal(true);
      } else {
        // 응모 성공 시 entryStatus를 true로 설정 (fallback)
        setEntryStatus(true);

        setShowSuccessModal(true);
      }

      console.log('성공 팝업 완료');

    } catch (error) {
      console.log('=== CATCH 블록 실행됨 ===');
      console.error("래플 참여 실패:", error);
      showErrorPopup(error);
    } finally {
      console.log('finally 블록 실행');
      setIsSubmitting(false);
      setParticipateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {error?.message || "래플 데이터를 불러오지 못했습니다."}
          </p>
          <button
            onClick={() => navigate("/raffle")}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 로딩 오버레이 */}
      {participateLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
              <p className="text-gray-700">처리 중...</p>
            </div>
          </div>
        </div>
      )}

      {/* 상품 이미지  */}
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
      </div>

      {/* 상품 정보 */}
      <div className="px-4 py-6">
        {/* 브랜드 및 상품명 */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm mb-1">{raffle.brandName}</p>
          <h1 className="text-xl font-bold text-gray-900 leading-tight mb-4">{raffle.productName}</h1>
        </div>

        {/* 가격 정보 */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-gray-400 line-through text-lg">
              {raffle.price?.toLocaleString()}원
            </span>
            <span className="text-2xl font-bold text-black">0원</span>
            <span className="text-red-500 font-bold text-lg">100%</span>
          </div>
        </div>

        {/* 래플 기간 정보 테이블 */}
        <div className="space-y-3 mb-6">
          <div className="flex">
            <div className="w-24 text-gray-600 text-sm">래플 응모기간</div>
            <div className="flex-1 text-sm text-gray-900">
              {new Date(raffle.startDate).toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric'
              })} ({new Date(raffle.startDate).toLocaleDateString('ko-KR', { weekday: 'short' }).slice(0, 1)}) 11:00 ~ {new Date(raffle.endDate).toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric'
              })} ({new Date(raffle.endDate).toLocaleDateString('ko-KR', { weekday: 'short' }).slice(0, 1)}) 11:00
            </div>
          </div>

          <div className="flex">
            <div className="w-24 text-gray-600 text-sm">당첨자 발표일</div>
            <div className="flex-1 text-sm text-gray-900">
              {new Date(raffle.endDate).toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric'
              })} ({new Date(raffle.endDate).toLocaleDateString('ko-KR', { weekday: 'short' }).slice(0, 1)}) 12:00
            </div>
          </div>

        </div>

        {/* 당첨자 정보 또는 안내 사항 */}
        {winnerName ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-700 font-medium">당첨자: {winnerName}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            <div className="flex">
              <div className="w-24 text-gray-600 text-sm">안내 사항</div>
              <div className="flex-1 text-sm text-gray-900">
                당첨자가 구매하지 않을 시, 예비 당첨자에게 기회를 드립니다.
              </div>
            </div>
          </div>
        )}

        {/* 참여 가능 여부 */}
        {!winnerName && (
          <div className="border-t pt-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">예비 당첨자 구매기간 안내</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              당첨자가 구매하지 않을 시, 추가 당첨 기회를 드립니다.
            </p>
          </div>
        )}

        {/* 참여 조건 표시 */}
        {!winnerName && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-gray-700 font-medium text-sm mb-2">
                {hasEnoughStock ? `${raffle.ecoStockName} 참여 가능` : `${raffle.ecoStockName} 에코스톡 부족`}
              </p>
              <p className="text-xs text-gray-500">
                보유: {currentQuantity}개 / 필요: {raffle.ecoStockAmount}개
              </p>
            </div>
          </div>
        )}

        {/* 카운트다운 타이머 */}
        <div className="mb-6">
          <CountdownTimer endDate={new Date(raffle.endDate)} large={true} />
        </div>
      </div>

      {/* 상세 이미지 */}
      {raffle.images && raffle.images.length > 0 && (
        <div className="bg-white px-4 py-6 mb-20">
          <h3 className="text-lg font-bold mb-4 text-gray-900">상품 상세</h3>
          <div className="space-y-4">
            {raffle.images
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((image, index) => (
                <img
                  key={image.imageId || index}
                  src={image.imageUrl}
                  alt={image.altText || `상품 상세 이미지 ${index + 1}`}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
          </div>
        </div>
      )}

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-4 border-t z-50">
        <button
          onClick={winnerName ? undefined : handleEnterRaffle}
          disabled={isSubmitting || entryStatus || winnerName}
          className={`w-full py-4 rounded-lg font-semibold transition-colors ${isSubmitting
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : entryStatus
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : winnerName
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : hasEnoughStock
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {isSubmitting
            ? '처리 중...'
            : winnerName
              ? '마감된 래플'
              : entryStatus
                ? '이미 참여한 래플입니다'
                : hasEnoughStock
                  ? '응모하기'
                  : `${raffle.ecoStockName} 에코스톡 부족`
          }
        </button>
      </div>

      {/* 모달들 */}
      <EntryModal />
      <SuccessModal />
      <ErrorModal />
    </div>
  );
};

export default RaffleDetailPage;