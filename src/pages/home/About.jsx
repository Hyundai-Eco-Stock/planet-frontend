import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Heart, Leaf, Users, Globe, Award, Star, Coffee, Recycle, Shield, Handshake } from 'lucide-react';
import heendyEarth from '@/assets/heendy-earth.png';

const About = () => {
    const context = useOutletContext();
    const setTitle = context?.setTitle;

    useEffect(() => {
        if (setTitle) {
            setTitle("브랜드 스토리");
        }
    }, [setTitle]);

    return (
        <div className="max-w-xl bg-white min-h-screen">

            {/* Header - context가 없을 때를 위한 fallback */}
            {!setTitle && (
                <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                    <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-bold text-black">브랜드 스토리</h1>
                    <div className="w-10 h-10" />
                </header>
            )}

            {/* Hero Section - 홈과 동일한 스타일 */}
            <section className="-mx-4 mb-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 text-center">
                    <div className="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                        <img
                            src={heendyEarth}
                            alt="흰디 지구"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <h3 className="text-lg font-bold text-black mb-2">지구를 지키는 흰디와 함께</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        ESG 가치를 실천하는 쇼핑으로 더 나은 내일을 만들어가요
                    </p>
                </div>
            </section>

            {/* Mission - 글래스모피즘 효과 */}
            <section className="px-4 mb-6">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/40 rounded-2xl p-6 text-center shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-2xl"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-sm border border-emerald-300/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-800 mb-2">MISSION & VISION</h3>
                            <p className="text-emerald-700 text-base font-medium leading-relaxed mb-2">
                                "고객을 행복하게, 세상을 풍요롭게"
                            </p>
                            <p className="text-emerald-600 text-sm">
                                고객에게 가장 신뢰받는 기업으로 더 나은 가치를 제공합니다
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="px-4 mb-6">
                <h3 className="text-lg font-bold text-black mb-4">실천 가치</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-white/70 backdrop-blur-sm border border-green-200/40 rounded-xl p-4 hover:scale-105 transition-all duration-200 shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-100/30 to-transparent rounded-xl"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-8 h-8 bg-green-400/20 backdrop-blur-sm border border-green-300/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <Leaf className="w-4 h-4 text-green-600" />
                                </div>
                                <h4 className="font-bold text-green-800 text-sm mb-1">ENVIRONMENT</h4>
                                <p className="text-xs text-green-600">친환경</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-teal-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-white/70 backdrop-blur-sm border border-teal-200/40 rounded-xl p-4 hover:scale-105 transition-all duration-200 shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 to-transparent rounded-xl"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-8 h-8 bg-teal-400/20 backdrop-blur-sm border border-teal-300/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <Users className="w-4 h-4 text-teal-600" />
                                </div>
                                <h4 className="font-bold text-teal-800 text-sm mb-1">COMMUNICATION</h4>
                                <p className="text-xs text-teal-600">소통</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-white/70 backdrop-blur-sm border border-purple-200/40 rounded-xl p-4 hover:scale-105 transition-all duration-200 shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-transparent rounded-xl"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-8 h-8 bg-purple-400/20 backdrop-blur-sm border border-purple-300/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <Handshake className="w-4 h-4 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-purple-800 text-sm mb-1">PARTNERSHIP</h4>
                                <p className="text-xs text-purple-600">파트너십</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-white/70 backdrop-blur-sm border border-orange-200/40 rounded-xl p-4 hover:scale-105 transition-all duration-200 shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 to-transparent rounded-xl"></div>
                            <div className="relative z-10 text-center">
                                <div className="w-8 h-8 bg-orange-400/20 backdrop-blur-sm border border-orange-300/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <Star className="w-4 h-4 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-orange-800 text-sm mb-1">CREATION</h4>
                                <p className="text-xs text-orange-600">창의</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ESG Achievements - 실제 2024 성과 */}
            <section className="px-4 mb-6">
                <h3 className="text-lg font-bold text-black mb-4">ESG 성과 (2024년)</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="text-center">
                            <div className="text-2xl font-black text-green-600 mb-1">A+</div>
                            <div className="text-xs text-gray-600 font-medium">유통업체 최초</div>
                            <div className="text-xs text-gray-500">통합 ESG 등급 2년 연속</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="text-center">
                            <div className="text-2xl font-black text-blue-600 mb-1">720억</div>
                            <div className="text-xs text-gray-600 font-medium">지속가능 상품</div>
                            <div className="text-xs text-gray-500">매출액</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="text-center">
                            <div className="text-2xl font-black text-orange-600 mb-1">41만개</div>
                            <div className="text-xs text-gray-600 font-medium">플라스틱 일회용기</div>
                            <div className="text-xs text-gray-500">감축량</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="text-center">
                            <div className="text-2xl font-black text-purple-600 mb-1">2.8만</div>
                            <div className="text-xs text-gray-600 font-medium">온실가스 배출</div>
                            <div className="text-xs text-gray-500">감축량 (tCO₂-eq)</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sustainability Initiatives - 실제 현대백화점 프로그램 */}
            <section className="px-4 mb-6">
                <h3 className="text-lg font-bold text-black mb-4">지속가능한 실천</h3>
                <div className="space-y-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-white/70 backdrop-blur-sm border border-emerald-200/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-200 shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-100/30 rounded-xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <h4 className="font-bold text-black">BeCLEAN 클린 뷰티</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    친환경 성분 인증을 받은 클린 뷰티 제품만을 엄선하여 제공하는 전문 스토어
                                </p>
                                <div className="inline-block bg-emerald-500/20 backdrop-blur-sm border border-emerald-300/30 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                                    더현대서울 · 판교점 · 목동점
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-white/70 backdrop-blur-sm border border-blue-200/40 rounded-xl p-4 hover:bg-white/80 transition-all duration-200 shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-100/30 rounded-xl"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <h4 className="font-bold text-black">Re.Green 온라인 편집관</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    지속가능성 기준을 통과한 102개 브랜드가 입점한 친환경 전문관
                                </p>
                                <div className="inline-block bg-blue-500/20 backdrop-blur-sm border border-blue-300/30 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                    102개 브랜드 입점
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Awards - 실제 수상 내역 */}
            <section className="px-4 mb-6">
                <h3 className="text-lg font-bold text-black mb-4">수상 내역</h3>
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative bg-white/70 backdrop-blur-sm border border-amber-200/40 rounded-xl p-4 shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-yellow-100/30 rounded-xl"></div>
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-400/20 backdrop-blur-sm border border-amber-300/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Award className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-amber-800">소비자가 뽑은 가장 신뢰하는 브랜드</div>
                                    <div className="text-xs text-amber-600">12년 연속 대상 수상</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-400/20 backdrop-blur-sm border border-amber-300/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Star className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-amber-800">산업 고객만족도 KCSI</div>
                                    <div className="text-xs text-amber-600">백화점 부문 7년 연속 1위</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-amber-400/20 backdrop-blur-sm border border-amber-300/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Leaf className="w-4 h-4 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-amber-800">탄소중립 생활 실천 우수기업</div>
                                    <div className="text-xs text-amber-600">3년 연속 선정</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action - 링크 연결 */}
            <section className="px-4 mb-6">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-400 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    <div className="relative bg-white/70 backdrop-blur-sm border border-green-200/40 rounded-2xl p-6 text-center shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-100/30 rounded-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-green-800 mb-2">지속가능한 쇼핑, 지금 시작하세요</h3>
                            <p className="text-green-700 text-sm mb-4">
                                친환경 제품부터 동물복지 인증 상품까지<br />
                                현대백화점에서 의미 있는 소비를 경험해보세요
                            </p>

                            <div className="flex gap-3">
                                <a
                                    href="/shopping/main"
                                    className="flex-1 bg-white/80 backdrop-blur-sm border border-green-300/30 text-green-700 py-3 px-4 rounded-xl font-medium text-sm hover:bg-white/90 transition-colors"
                                >
                                    쇼핑하기
                                </a>
                                <a
                                    href="/eco-deal/main"
                                    className="flex-1 bg-green-500/20 backdrop-blur-sm border border-green-300/30 text-green-800 py-3 px-4 rounded-xl font-medium text-sm hover:bg-green-500/30 transition-colors"
                                >
                                    푸드딜
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact - 현대백화점 본사 주소 */}
            <section className="px-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-bold text-black mb-3">더 자세한 정보가 필요하시나요?</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div>📧 esg@planet.com</div>
                        <div>📍 서울특별시 강남구 테헤란로 98길 12</div>
                        <div>📞 고객센터 1588-2233</div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default About;