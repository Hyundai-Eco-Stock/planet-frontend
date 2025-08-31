import { useMemo } from "react";

const DUMMY = [
  {
    memberStockInfoId: 1,
    memberId: 12,
    ecoStockId: 1,
    currentTotalQuantity: 3690,
    currentTotalAmount: 461250,
    point: 1657520,
    ecoStockName: "텀블러",
  },
  {
    memberStockInfoId: 2,
    memberId: 12,
    ecoStockId: 2,
    currentTotalQuantity: 3690,
    currentTotalAmount: 461250,
    point: 1657520,
    ecoStockName: "친환경 제품",
  },
];

const MyEcoStockInfo = () => {
  const summary = useMemo(() => {
    const totalQty = DUMMY.reduce((s, v) => s + (v.currentTotalQuantity || 0), 0);
    const totalAmt = DUMMY.reduce((s, v) => s + (v.currentTotalAmount || 0), 0);
    const totalPoint = DUMMY.reduce((s, v) => s + (v.point || 0), 0);
    return { totalQty, totalAmt, totalPoint };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      {/* 요약 바 */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Stat label="총 수량" value={formatNumber(summary.totalQty)} suffix="개" />
        <Stat label="총 금액" value={formatNumber(summary.totalAmt)} suffix="원" />
        <Stat label="총 포인트" value={formatNumber(summary.totalPoint)} suffix="P" />
      </div>

      {/* 아이템 카드 그리드 */}
      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {DUMMY.map((it) => (
          <EcoCard key={it.memberStockInfoId} data={it} />)
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, suffix }) => (
  <div
    style={{
      border: "1px solid #eee",
      borderRadius: 12,
      padding: 16,
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    }}
  >
    <div style={{ color: "#6b7280", fontSize: 12 }}>{label}</div>
    <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700 }}>
      {value}
      <span style={{ marginLeft: 4, fontSize: 12, color: "#6b7280" }}>{suffix}</span>
    </div>
  </div>
);

const EcoCard = ({ data }) => {
  const {
    ecoStockName,
    currentTotalQuantity,
    currentTotalAmount,
    point,
  } = data || {};

  return (
    <div
      role="article"
      aria-label={ecoStockName}
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ padding: 16 }}>
        {/* 상단 타이틀 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#22c55e",
          }} />
          <div style={{ fontSize: 16, fontWeight: 700 }}>{ecoStockName}</div>
        </div>

        {/* 내용 */}
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <KV label="보유 수량" value={`${formatNumber(currentTotalQuantity)} 개`} />
          <KV label="평가 금액" value={`${formatNumber(currentTotalAmount)} 원`} />
          <KV label="적립 포인트" value={`${formatNumber(point)} P`} />
        </div>
      </div>
    </div>
  );
};

const KV = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
  </div>
);

function formatNumber(n) {
  const num = Number(n || 0);
  return num.toLocaleString("ko-KR");
}

export default MyEcoStockInfo;