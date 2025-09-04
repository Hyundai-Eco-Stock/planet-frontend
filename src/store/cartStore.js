import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      // 일반 배송 장바구니 (DELIVERY)
      deliveryCart: [],
      // 픽업 배송 장바구니 (PICKUP - 에코딜 상품만)
      pickupCart: [],

      // 매장 중복 확인 함수
      checkStoreConflict: (productId, newStoreId) => {
        const { pickupCart } = get()
        const existingProduct = pickupCart.find(cartProduct => cartProduct.id === productId)
        
        if (existingProduct && existingProduct.selectedStore) {
          // 같은 상품이 존재하고 다른 매장인 경우
          if (existingProduct.selectedStore.id !== newStoreId) {
            return {
              hasConflict: true,
              existingStore: existingProduct.selectedStore,
              existingQuantity: existingProduct.quantity
            }
          }
        }
        
        return { hasConflict: false }
      },
      
      // 장바구니에 상품 추가 (상품 타입에 따라 자동 분류)
      addToCart: (product, quantity = 1, options = {}) => {
        // 매장 충돌 처리 옵션
        const { force = false, action = null } = options
        
        // 에코딜 상품이면 픽업 장바구니, 아니면 일반 배송 장바구니
        const cartKey = product.isEcoDeal ? 'pickupCart' : 'deliveryCart'
        const currentCart = get()[cartKey]
        
        const existingProduct = currentCart.find(cartProduct => cartProduct.id === product.id)
        
        // 에코딜 상품이고 매장 정보가 있는 경우에만 충돌 검사
        if (product.isEcoDeal && product.selectedStore && existingProduct && !force) {
          // 다른 매장인지 확인
          if (existingProduct.selectedStore && existingProduct.selectedStore.id !== product.selectedStore.id) {
            // 충돌 발생 - 외부에서 처리하도록 에러 반환
            throw new Error('STORE_CONFLICT')
          }
        }
        
        if (existingProduct) {
          if (action === 'replace') {
            // 새 매장으로 교체 (매장 충돌 해결용)
            set({
              [cartKey]: currentCart.map(cartProduct =>
                cartProduct.id === product.id 
                  ? { ...product, quantity: quantity }  // 완전히 새 상품으로 교체
                  : cartProduct
              )
            })
          } else {
            // 기본 동작: 수량만 증가 (기존 상품 정보 유지)
            set({
              [cartKey]: currentCart.map(cartProduct =>
                cartProduct.id === product.id 
                  ? { 
                      ...cartProduct, 
                      quantity: cartProduct.quantity + quantity,
                      // 매장 정보가 없었는데 새로 추가되는 경우 매장 정보 업데이트
                      ...(product.selectedStore && !cartProduct.selectedStore && {
                        selectedStore: product.selectedStore
                      })
                    }
                  : cartProduct
              )
            })
          }
        } else {
          // 새 상품 추가
          set({
            [cartKey]: [...currentCart, { ...product, quantity }]
          })
        }
        
        // 상태 변경 즉시 이벤트 발생
        window.dispatchEvent(new CustomEvent('cartStorageUpdate', {
          detail: { cartKey, productId: product.id, quantity }
        }));

        return { success: true }
      },
      
      // 수량 업데이트
      updateQuantity: (productId, quantity, isEcoDeal) => {
        const cartKey = isEcoDeal ? 'pickupCart' : 'deliveryCart'
        const currentCart = get()[cartKey]
        
        if (quantity <= 0) {
          set({
            [cartKey]: currentCart.filter(cartProduct => cartProduct.id !== productId)
          })
        } else {
          set({
            [cartKey]: currentCart.map(cartProduct =>
              cartProduct.id === productId 
                ? { ...cartProduct, quantity }
                : cartProduct
            )
          })
        }
        
        // localStorage 변경 알림
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartStorageUpdate'));
        }, 0);
      },
      
      // 상품 삭제
      removeFromCart: (productId, isEcoDeal) => {
        const cartKey = isEcoDeal ? 'pickupCart' : 'deliveryCart'
        const currentCart = get()[cartKey]
        
        set({
          [cartKey]: currentCart.filter(cartProduct => cartProduct.id !== productId)
        })
        
        // localStorage 변경 알림
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartStorageUpdate'));
        }, 0);
      },
      
      // 결제 완료된 상품들만 선택적 삭제
      removeOrderedProducts: (orderedProducts) => {
        const { deliveryCart, pickupCart } = get()
        
        // 주문된 상품 ID 목록 생성
        const orderedProductIds = orderedProducts.map(product => product.productId || product.id)
        
        // 배송 장바구니에서 주문된 상품들 제거
        const newDeliveryCart = deliveryCart.filter(cartProduct => {
          const orderedProduct = orderedProducts.find(op => 
            (op.productId || op.id) === cartProduct.id
          )
          
          if (!orderedProduct) return true // 주문되지 않은 상품은 유지
          
          // 주문 수량보다 장바구니 수량이 많으면 차감만
          if (cartProduct.quantity > orderedProduct.quantity) {
            cartProduct.quantity -= orderedProduct.quantity
            return true
          }
          
          // 주문 수량과 같거나 적으면 제거
          return false
        })
        
        // 픽업 장바구니에서 주문된 상품들 제거 
        const newPickupCart = pickupCart.filter(cartProduct => {
          const orderedProduct = orderedProducts.find(op => 
            (op.productId || op.id) === cartProduct.id
          )
          
          if (!orderedProduct) return true // 주문되지 않은 상품은 유지
          
          // 주문 수량보다 장바구니 수량이 많으면 차감만
          if (cartProduct.quantity > orderedProduct.quantity) {
            cartProduct.quantity -= orderedProduct.quantity
            return true
          }
          
          // 주문 수량과 같거나 적으면 제거
          return false
        })
        
        set({
          deliveryCart: newDeliveryCart,
          pickupCart: newPickupCart
        })
        
        // localStorage 변경 알림
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartStorageUpdate'));
        }, 0);
      },
      
      // 전체 삭제
      clearCart: (cartType = 'all') => {
        if (cartType === 'all') {
          set({ deliveryCart: [], pickupCart: [] })
        } else if (cartType === 'pickup') {
          set({ pickupCart: [] })
        } else if (cartType === 'delivery') {
          set({ deliveryCart: [] })
        }
        
        // localStorage 변경 알림
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cartStorageUpdate'));
        }, 0);
      },
      
      // 총 가격 계산
      getTotalPrice: (cartType = 'delivery') => {
        const cartKey = cartType === 'pickup' ? 'pickupCart' : 'deliveryCart'
        const cart = get()[cartKey]
        
        return cart.reduce((total, product) => {
          // 에코딜 상품(픽업)이면 할인율 적용, 일반 상품은 원가
          const discountedPrice = product.isEcoDeal 
            ? product.price * (1 - product.salePercent / 100)
            : product.price
          return total + (discountedPrice * product.quantity)
        }, 0)
      },
      
      // 총 상품 개수
      getTotalProducts: (cartType = 'delivery') => {
        const cartKey = cartType === 'pickup' ? 'pickupCart' : 'deliveryCart'
        const cart = get()[cartKey]
        return cart.length
      },
      
      // 총 상품 개수 (전체)
      getTotalCount: () => {
        const { deliveryCart, pickupCart } = get()
        return deliveryCart.length + pickupCart.length
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)

export default useCartStore