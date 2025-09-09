import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      // 일반 배송 장바구니 (DELIVERY)
      deliveryCart: [],
      // 픽업 장바구니 (PICKUP/에코딜)
      pickupCart: [],

      /** 현재 픽업 카트의 매장 정보 반환 (없으면 null) */
      getPickupStore() {
        const { pickupCart } = get()
        const p = pickupCart.find(x => x?.selectedStore?.id != null)
        return p?.selectedStore ?? null
      },

      checkStoreConflict: (productId, newStoreId) => {
        const { pickupCart } = get()
        const existingStore = get().getPickupStore()
        const existingProduct = pickupCart.find(p => p.id === productId)
        const hasConflict =
          !!existingStore?.id && !!newStoreId && String(existingStore.id) !== String(newStoreId)
        return {
          hasConflict,
          existingStore: existingStore ?? null,
          existingQuantity: existingProduct?.quantity ?? 0,
        }
      },
      
      addToCart: (product, quantity = 1, options = {}) => {
        const { force = false, action = null } = options

        // 에코딜 → pickupCart, 일반 → deliveryCart
        const cartKey = product.isEcoDeal ? 'pickupCart' : 'deliveryCart'
        const currentCart = get()[cartKey]

        // 픽업 카트는 "단일 매장" 규칙 적용 (상품별 매장 가드는 호출부에서 보장)
        if (cartKey === 'pickupCart' && product.selectedStore && !force) {
          const { hasConflict } = get().checkStoreConflict(product.id, product.selectedStore.id)
          if (hasConflict) {
            // UI에서 모달을 띄우도록 신호
            throw new Error('STORE_CONFLICT')
          }
        }

        // 새 매장으로 교체(픽업 카트 전체 교체)
        if (action === 'replace' && cartKey === 'pickupCart') {
          set({ pickupCart: [{ ...product, quantity }] })
          window.dispatchEvent(new CustomEvent('cartStorageUpdate', {
            detail: { cartKey, productId: product.id, quantity, action: 'replace' },
          }))
          return { success: true, replaced: true }
        }

        // 동일 id 존재 시 수량 증가, 없으면 append
        const existing = currentCart.find(p => p.id === product.id)
        if (existing) {
          set({
            [cartKey]: currentCart.map(p =>
              p.id === product.id
                ? {
                    ...p,
                    quantity: p.quantity + quantity,
                    // 이전에 매장정보가 없고 신규에 있으면 보완
                    ...(product.selectedStore && !p.selectedStore && { selectedStore: product.selectedStore }),
                  }
                : p
            ),
          })
        } else {
          set({ [cartKey]: [...currentCart, { ...product, quantity }] })
        }

        window.dispatchEvent(new CustomEvent('cartStorageUpdate', {
          detail: { cartKey, productId: product.id, quantity },
        }))

        return { success: true }
      },

      // 수량 업데이트
      updateQuantity: (productId, quantity, isEcoDeal) => {
        const cartKey = isEcoDeal ? 'pickupCart' : 'deliveryCart'
        const currentCart = get()[cartKey]

        if (quantity <= 0) {
          set({ [cartKey]: currentCart.filter(p => p.id !== productId) })
        } else {
          set({
            [cartKey]: currentCart.map(p => (p.id === productId ? { ...p, quantity } : p)),
          })
        }
        setTimeout(() => window.dispatchEvent(new CustomEvent('cartStorageUpdate')), 0)
      },

      // 상품 삭제
      removeFromCart: (productId, isEcoDeal) => {
        const cartKey = isEcoDeal ? 'pickupCart' : 'deliveryCart'
        const currentCart = get()[cartKey]
        set({ [cartKey]: currentCart.filter(p => p.id !== productId) })
        setTimeout(() => window.dispatchEvent(new CustomEvent('cartStorageUpdate')), 0)
      },

      // 결제 완료된 상품들만 선택적 삭제
      removeOrderedProducts: (orderedProducts) => {
        const { deliveryCart, pickupCart } = get()
        const orderedProductIds = orderedProducts.map(p => p.productId || p.id)

        const newDeliveryCart = deliveryCart.filter(p => {
          const op = orderedProducts.find(op => (op.productId || op.id) === p.id)
          if (!op) return true
          if (p.quantity > op.quantity) { p.quantity -= op.quantity; return true }
          return false
        })

        const newPickupCart = pickupCart.filter(p => {
          const op = orderedProducts.find(op => (op.productId || op.id) === p.id)
          if (!op) return true
          if (p.quantity > op.quantity) { p.quantity -= op.quantity; return true }
          return false
        })

        set({ deliveryCart: newDeliveryCart, pickupCart: newPickupCart })
        setTimeout(() => window.dispatchEvent(new CustomEvent('cartStorageUpdate')), 0)
      },

      // 전체 삭제
      clearCart: (cartType = 'all') => {
        if (cartType === 'all') set({ deliveryCart: [], pickupCart: [] })
        else if (cartType === 'pickup') set({ pickupCart: [] })
        else if (cartType === 'delivery') set({ deliveryCart: [] })
        setTimeout(() => window.dispatchEvent(new CustomEvent('cartStorageUpdate')), 0)
      },

      // 총 가격 계산
      getTotalPrice: (cartType = 'delivery') => {
        const cartKey = cartType === 'pickup' ? 'pickupCart' : 'deliveryCart'
        return get()[cartKey].reduce((total, p) => {
          const price = p.isEcoDeal ? p.price * (1 - p.salePercent / 100) : p.price
          return total + price * p.quantity
        }, 0)
      },

      // 총 상품 개수
      getTotalProducts: (cartType = 'delivery') => {
        const cartKey = cartType === 'pickup' ? 'pickupCart' : 'deliveryCart'
        return get()[cartKey].length
      },

      // 총 상품 개수 (전체)
      getTotalCount: () => {
        const { deliveryCart, pickupCart } = get()
        return deliveryCart.length + pickupCart.length
      },
    }),
    { name: 'cart-storage' }
  )
)

export default useCartStore
