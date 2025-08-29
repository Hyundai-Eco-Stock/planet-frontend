import { useEffect, useState } from "react";
import { fetchMyRaffles } from "@/api/member/member.api";

const statusStyles = {
  Y: {
    background: "linear-gradient(90deg, rgba(46,204,113,1) 0%, rgba(39,174,96,1) 100%)",
    color: "#fff",
    label: "당첨",
  },
  N: {
    background: "#9aa0a6",
    color: "#fff",
    label: "미당첨",
  },
};

const MyRaffleHistory = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMyRaffles();
        // res 가 배열이라고 가정, 방어적으로 처리
        setRaffles(Array.isArray(res) ? res : res?.data ?? []);
      } catch (e) {
        setError("응모내역을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ margin: 0 }}>내 래플 응모내역</h1>
        <p style={{ marginTop: 12, color: "#666" }}>불러오는 중…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ margin: 0 }}>내 래플 응모내역</h1>
        <p style={{ marginTop: 12, color: "#d93025" }}>{error}</p>
      </div>
    );
  }

  if (!raffles.length) {
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ margin: 0 }}>내 래플 응모내역</h1>
        <div style={{
          marginTop: 24,
          padding: 24,
          border: "1px dashed #e0e0e0",
          borderRadius: 12,
          textAlign: "center",
          color: "#777",
        }}>
          아직 응모내역이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>내 래플 응모내역</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {raffles.map((r) => (
          <RaffleCard key={r.raffleHistoryId} data={r} />
        ))}
      </div>
    </div>
  );
};

const RaffleCard = ({ data }) => {
  const {
    winStatus = "N",
    productName,
    productImageUrl,
    startDate,
    endDate,
  } = data || {};

  const s = statusStyles[winStatus] || statusStyles.N;

  return (
    <div
      role="article"
      aria-label={productName}
      style={{
        position: "relative",
        border: "1px solid #eee",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* 상태 리본 */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: -32,
          transform: "rotate(-45deg)",
          padding: "6px 48px",
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          ...s,
        }}
      >
        {s.label}
      </div>

      {/* 이미지 */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          background: "#f7f7f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {productImageUrl ? (
          <img
            src={productImageUrl}
            alt={productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <span style={{ color: "#aaa", fontSize: 12 }}>이미지 없음</span>
        )}
      </div>

      {/* 내용 */}
      <div style={{ padding: 14 }}>
        <div
          title={productName}
          style={{
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {productName}
        </div>

        {/* 기간 뱃지 */}
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip>{formatDate(startDate)} ~ {formatDate(endDate)}</Chip>
        </div>
      </div>
    </div>
  );
};

const Chip = ({ children }) => (
  <span
    style={{
      display: "inline-block",
      border: "1px solid #e0e0e0",
      background: "#fafafa",
      borderRadius: 999,
      padding: "6px 10px",
      fontSize: 12,
      color: "#555",
    }}
  >
    {children}
  </span>
);

function formatDate(s) {
  if (!s) return "-";
  // "2025-08-21 00:00:00" -> "2025.08.21"
  const [date] = String(s).split(" ");
  const [y, m, d] = date.split("-");
  return `${y}.${m}.${d}`;
}

export default MyRaffleHistory;