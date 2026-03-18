import { CartItem, Product } from "@/lib/types"

export interface CartState {
  items: CartItem[]
}

export type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; items: CartItem[] }

/**
 * Reducer puro para el estado del carrito de compras.
 * No tiene efectos secundarios — apto para unit testing sin mocks.
 *
 * @param state - Estado actual con el array de CartItems
 * @param action - Acción a procesar
 * @returns Nuevo estado inmutable del carrito
 *
 * Notas de comportamiento:
 * - `ADD_ITEM`: si el producto ya existe, incrementa cantidad sin superar `product.stock`.
 * - `UPDATE_QUANTITY`: si `quantity <= 0`, elimina el ítem del carrito.
 * - `HYDRATE`: reemplaza el estado completo (usado al cargar desde localStorage).
 *
 * @example
 * const state = cartReducer({ items: [] }, {
 *   type: "ADD_ITEM",
 *   product: { id: "1", name: "RTX 4080", stock: 5, price: 1200, ...},
 *   quantity: 2
 * })
 * // → { items: [{ product, quantity: 2 }] }
 *
 * cartReducer(state, { type: "UPDATE_QUANTITY", productId: "1", quantity: 0 })
 * // → { items: [] }  (quantity 0 elimina el ítem)
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.product.id === action.product.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: Math.min(i.quantity + action.quantity, i.product.stock) }
              : i
          ),
        }
      }
      return { items: [...state.items, { product: action.product, quantity: action.quantity }] }
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.product.id !== action.productId) }
    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.product.id !== action.productId) }
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      }
    }
    case "CLEAR_CART":
      return { items: [] }
    case "HYDRATE":
      return { items: action.items }
    default:
      return state
  }
}
