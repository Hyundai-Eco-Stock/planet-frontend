// RaffleDetailPage.js
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CountdownTimer from "@/components/raffle/CountdownTimer";
import { getRaffleDetail } from "@/api/raffleDetail/raffleDetail.api";
import { raffleParticipate } from "@/api/raffleParticipate/raffleParticipate.api";
import Swal from 'sweetalert2'; // SweetAlert2 추가
import { getMemberStockInfoAll } from "@/api/memberStockInfoAll/memberStockInfoAll.api";
import { getRaffleEntryStatus } from "@/api/raffleEntryStatus/raffleEntryStatus.api";

const RaffleDetailPage = () => {
  const { raffleId } = useParams();
  const navigate = useNavigate();
  // 두 번째 방법 (추천)
  const location = useLocation();
  const winnerName = location.state?.winnerName;
  const [personalStockInfoList, setPersonalStockInfoList] = useState([]);
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participateLoading, setParticipateLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryStatus, setEntryStatus] = useState(false);


  // personalStockInfoList를 API로 가져오는 useEffect 추가
  useEffect(() => {
    const fetchPersonalStockInfo = async () => {
      try {
        const stockData = await getMemberStockInfoAll();
        setPersonalStockInfoList(stockData || []);
      } catch (err) {
        console.error("개인 에코스톡 정보 조회 실패:", err);
        // 에러가 발생해도 빈 배열로 유지하여 페이지가 정상 동작하도록 함
        setPersonalStockInfoList([]);
      }
    };

    fetchPersonalStockInfo();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  useEffect(() => {
    const fetchRaffleEntryStatus = async () => {
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

  // SweetAlert2 팝업들
  const showRaffleEntryPopup = async () => {
    return await Swal.fire({
      title: '🎊 래플 응모 조건',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
            <span style="color: #22c55e; font-size: 14px;">✓</span>
            <p style="font-size: 14px; color: #374151; margin: 0;">1인 1회 응모 가능</p>
          </div>
          <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
            <span style="color: #22c55e; font-size: 14px;">✓</span>
            <p style="font-size: 14px; color: #374151; margin: 0;">당첨 시 본인 확인 필요</p>
          </div>
          <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
            <span style="color: #22c55e; font-size: 14px;">✓</span>
            <p style="font-size: 14px; color: #374151; margin: 0;">배송비 무료</p>
          </div>
          <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 8px;">
            <span style="color: #ef4444; font-size: 14px;">⚠</span>
            <p style="font-size: 14px; color: #374151; margin: 0;">응모 취소 불가</p>
          </div>
          <div style="background-color: #f0fdf4; padding: 12px; border-radius: 8px; margin-top: 16px;">
            <p style="font-size: 14px; color: #15803d; font-weight: 500; text-align: center; margin: 0;">
              🎁 ${raffle.ecoStockName} 에코스톡 ${raffle.ecoStockAmount}개 필요
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '응모하기',
      cancelButtonText: '취소',
    });
  };

  const showSuccessPopup = async () => {
    await Swal.fire({
      title: '응모 완료! 🎉',
      text: '래플 참여가 완료되었습니다!',
      icon: 'success',
      confirmButtonText: '확인',
      confirmButtonColor: '#22c55e',
    });
  };

  const showErrorPopup = async (error) => {
    console.log('전체 에러 객체:', error);
    console.log('에러 응답 데이터:', error.response?.data);
    console.log('에러 응답 상태:', error.response?.status);

    let title = '응모 실패';
    let message = '응모 처리 중 오류가 발생했습니다.';
    let icon = 'error';

    // 백엔드 에러 응답 구조 확인
    if (error.response?.data) {
      const { errorCode, message: errorMessage } = error.response.data;
      console.log('errorCode:', errorCode);
      console.log('errorMessage:', errorMessage);

      switch (errorCode) {
        case 'RAFFLE_NOT_FOUND':
          title = '래플 없음';
          icon = 'warning';
          break;
        case 'DUPLICATE_PARTICIPATION':
          title = '중복 응모';
          icon = 'warning';
          break;
        case 'INSUFFICIENT_STOCK':
          title = '에코스톡 부족';
          icon = 'warning';
          break;
        case 'RAFFLE_SYSTEM_ERROR':
          title = '시스템 오류';
          icon = 'error';
          break;
      }

      message = errorMessage || message;
    }

    await Swal.fire({
      title: title,
      text: message,
      icon: icon,
      confirmButtonText: '확인',
      confirmButtonColor: '#ef4444',
    });
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

  const handleEnterRaffle = async () => {
    const result = await showRaffleEntryPopup();
    if (result.isConfirmed) {
      await handleConfirmEntry();
    }
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
        await showSuccessPopup(result.remainingQuantity);
      } else {
        await showSuccessPopup(currentQuantity - raffle.ecoStockAmount); // fallback
      }

      console.log('성공 팝업 완료');

    } catch (error) {
      console.log('=== CATCH 블록 실행됨 ===');
      console.error("래플 참여 실패:", error);
      await showErrorPopup(error);
    } finally {
      console.log('finally 블록 실행');
      setIsSubmitting(false);
      setParticipateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p>불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600 mb-4 text-center">
            {error?.message || "래플 데이터를 불러오지 못했습니다."}
          </p>
          <button
            onClick={() => navigate("/raffle")}
            className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-6 relative">
      {participateLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
              <p className="text-gray-700">불러오는 중...</p>
            </div>
          </div>
        </div>
      )}
      {/* 상단 이미지 */}
      <div className="bg-white">
        <div className="relative">
          <img
            src={raffle.imageUrl}
            alt={raffle.productName}
            className="w-full h-96 object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
      </div>

      {/* 상품 기본 정보 */}
      <div className="px-6 py-6">
        <div className="text-gray-500 text-sm mb-2">{raffle.brandName}</div>
        <h1 className="text-xl font-bold text-gray-900 mb-6 leading-tight">{raffle.productName}</h1>

        {/* 가격 정보 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg text-gray-500 line-through">
              정가 {raffle.price?.toLocaleString()}원
            </span>
            <span className="text-xl font-bold text-red-500">→</span>
            <span className="text-xl font-bold text-green-600">무료</span>
          </div>
          <div className="text-xs text-gray-500">
            래플 당첨 시 100% 무료로 받아가세요
          </div>
        </div>
        {/* 당첨자가 있으면 당첨자 정보, 없으면 기존 에코스톡 정보 */}
        {winnerName ? (
          <div className="mb-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏆</span>
                </div>
                <div className="text-sm font-medium text-yellow-800">
                  당첨자: {winnerName}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 에코스톡 보유 현황 */}
            <div className="mb-6">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${hasEnoughStock
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-red-100 text-red-700 border-2 border-red-300'
                }`}>
                {hasEnoughStock ? (
                  <span className="flex items-center gap-2">
                    <span>✅ 응모 가능</span>
                    <span className="text-xs">({currentQuantity}개 보유)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>❌ {raffle.ecoStockName} 부족</span>
                    <span className="text-xs">({currentQuantity}/{raffle.ecoStockAmount}개)</span>
                  </span>
                )}
              </div>
            </div>

            {/* 응모 조건 */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🎁</span>
                </div>
                <div className="text-sm font-medium text-green-800">
                  {raffle.ecoStockName} 에코스톡 {raffle.ecoStockAmount}개 필요
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mb-4">
          <CountdownTimer endDate={new Date(raffle.endDate)} large={true} />
        </div>

        {/* 래플 기간 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">시작일</div>
            <div className="font-semibold text-gray-900">
              {new Date(raffle.startDate).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <div className="text-xs text-red-500 mb-1">마감일</div>
            <div className="font-semibold text-red-600">
              {new Date(raffle.endDate).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 이미지 */}
      {raffle.images && raffle.images.length > 0 && (
        <div className="bg-white px-6 py-6 pb-32">
          <h3 className="text-lg font-bold mb-4">상품 상세</h3>
          <div className="space-y-4">
            {raffle.images
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((image, index) => (
                <img
                  key={image.imageId || index}
                  src={image.imageUrl}
                  alt={image.altText || `상품 상세 이미지 ${index + 1}`}
                  className="w-full rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
          </div>
        </div>
      )}

      {/* 하단 응모 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-4 border-t shadow-lg z-50">
        <button
          onClick={winnerName ? undefined : handleEnterRaffle}
          disabled={isSubmitting || entryStatus || winnerName}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors shadow-md ${isSubmitting
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : entryStatus
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : winnerName
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : hasEnoughStock
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-red-500 text-white hover:bg-red-600'
            }`}
        >
          {isSubmitting
            ? '처리 중...'
            : winnerName
              ? '🏆 마감'
              : entryStatus
                ? '✅ 이미 참여한 래플입니다'
                : hasEnoughStock
                  ? '🎯 응모하기'
                  : `❌ ${raffle.ecoStockName} 부족`
          }
        </button>
      </div>

      {/* 기존 모달 제거 - SweetAlert2로 대체됨 */}
    </div>
  );
};

export default RaffleDetailPage;