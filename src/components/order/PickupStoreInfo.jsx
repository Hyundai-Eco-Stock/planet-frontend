import React from 'react'

const PickupStoreInfo = ({ storeGroups }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">픽업 매장 정보</h2>
      
      {storeGroups && storeGroups.length > 0 ? (
        <div className="space-y-4">
          {storeGroups.map((storeGroup, index) => {
            const { store, products } = storeGroup
            
            return (
              <div key={store.id || index} className="border border-gray-200 rounded-lg p-4">
                {/* 매장 정보 */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{store.name}</h3>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{store.address}</span>
                      </div>
                      
                      {store.phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{store.phone}</span>
                        </div>
                      )}
                      
                      {store.operatingHours && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{store.operatingHours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 매장 변경 불가 안내 */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      선택 완료
                    </span>
                  </div>
                </div>
                
                {/* 해당 매장의 상품 목록 */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-sm text-gray-600 mb-2">
                    픽업 상품 ({products.length}개)
                  </div>
                  <div className="space-y-2">
                    {products.map((product, productIndex) => (
                      <div key={product.id || productIndex} className="flex items-center space-x-3 text-sm">
                        <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {product.quantity}
                          </span>
                        </div>
                        <span className="text-gray-900">{product.name}</span>
                        {product.ecoDealStatus && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            에코딜
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p>픽업 매장 정보가 없습니다.</p>
        </div>
      )}
      
      {/* 픽업 안내 사항 */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">픽업 안내사항</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• 결제 완료 후 QR코드가 발송됩니다.</p>
          <p>• 매장 방문 시 QR코드를 제시해주세요.</p>
          <p>• 픽업 가능 시간: 매장 운영시간 내</p>
        </div>
      </div>
      
      {/* 매장 변경 안내 */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• 매장 변경을 원하시면 장바구니에서 다시 선택해주세요.</p>
        <p>• 픽업 상품은 에코딜 상품만 가능합니다.</p>
      </div>
    </div>
  )
}

export default PickupStoreInfo