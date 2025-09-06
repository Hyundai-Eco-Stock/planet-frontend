import { useState } from "react";
import MyEcoStockInfo from "@/pages/mypage/MyEcoStockInfo";
import MyPointHistory from "@/pages/mypage/MyPointHistory";

const MyAssetsPage = () => {
    const [activeTab, setActiveTab] = useState("stock"); // stock | point

    return (
        <div className="p-4 md:p-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
                <nav className="flex gap-6 -mb-px">
                    <button
                        onClick={() => setActiveTab("stock")}
                        className={`flex-1 pb-2 text-sm font-semibold ${activeTab === "stock"
                                ? "border-b-2 border-emerald-500 text-emerald-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        내 에코스톡
                    </button>
                    <button
                        onClick={() => setActiveTab("point")}
                        className={`flex-1 pb-2 text-sm font-semibold ${activeTab === "point"
                                ? "border-b-2 border-amber-500 text-amber-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        포인트 기록
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "stock" && <MyEcoStockInfo />}
            {activeTab === "point" && <MyPointHistory />}
        </div>
    );
};

export default MyAssetsPage;