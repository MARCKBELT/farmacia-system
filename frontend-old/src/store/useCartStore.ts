import { create } from 'zustand'

interface CartItem {
  productId: number
  productSku: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  stockId?: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (item) => {
    const items = get().items
    const existingItem = items.find(i => i.productId === item.productId)
    
    if (existingItem) {
      set({
        items: items.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.unitPrice }
            : i
        ),
      })
    } else {
      set({ items: [...items, item] })
    }
  },
  
  removeItem: (productId) => {
    set({ items: get().items.filter(i => i.productId !== productId) })
  },
  
  updateQuantity: (productId, quantity) => {
    set({
      items: get().items.map(i =>
        i.productId === productId
          ? { ...i, quantity, total: quantity * i.unitPrice }
          : i
      ),
    })
  },
  
  clearCart: () => set({ items: [] }),
  
  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.total, 0)
  },
  
  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  },
}))
