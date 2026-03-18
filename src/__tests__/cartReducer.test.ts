/**
 * Tests unitarios para cartReducer
 * Función pura — sin mocks necesarios.
 */
import { cartReducer } from "@/lib/cartReducer"
import { CartItem, Product } from "@/lib/types"

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "p1",
  name: "RTX 4080",
  description: "GPU de alto rendimiento",
  price: 999,
  image: "/img.jpg",
  images: ["/img.jpg"],
  category: "gpus",
  specs: [{ label: "VRAM", value: "16GB" }],
  stock: 10,
  rating: 4.8,
  reviews: 100,
  ...overrides,
})

const emptyState = { items: [] as CartItem[] }
const stateWithOne = {
  items: [{ product: makeProduct(), quantity: 2 }],
}

// ─── 1. Happy Path ────────────────────────────────────────────────────────────

describe("Happy Path", () => {
  it("deberia_agregar_un_nuevo_producto_al_carrito_vacio", () => {
    const product = makeProduct()
    const result = cartReducer(emptyState, { type: "ADD_ITEM", product, quantity: 1 })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].product.id).toBe("p1")
    expect(result.items[0].quantity).toBe(1)
  })

  it("deberia_incrementar_cantidad_si_el_producto_ya_existe_en_carrito", () => {
    const product = makeProduct()
    const result = cartReducer(stateWithOne, { type: "ADD_ITEM", product, quantity: 3 })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].quantity).toBe(5) // 2 + 3
  })

  it("deberia_eliminar_el_producto_correcto_dejando_los_demas", () => {
    const state = {
      items: [
        { product: makeProduct({ id: "p1" }), quantity: 1 },
        { product: makeProduct({ id: "p2", name: "Monitor" }), quantity: 2 },
      ],
    }
    const result = cartReducer(state, { type: "REMOVE_ITEM", productId: "p1" })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].product.id).toBe("p2")
  })

  it("deberia_actualizar_cantidad_de_un_producto_existente", () => {
    const result = cartReducer(stateWithOne, {
      type: "UPDATE_QUANTITY",
      productId: "p1",
      quantity: 7,
    })

    expect(result.items[0].quantity).toBe(7)
  })

  it("deberia_vaciar_el_carrito_completamente_con_CLEAR_CART", () => {
    const result = cartReducer(stateWithOne, { type: "CLEAR_CART" })

    expect(result.items).toHaveLength(0)
  })

  it("deberia_hidratar_el_carrito_desde_localStorage_con_HYDRATE", () => {
    const hydrated: CartItem[] = [
      { product: makeProduct({ id: "p99" }), quantity: 5 },
    ]
    const result = cartReducer(emptyState, { type: "HYDRATE", items: hydrated })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].product.id).toBe("p99")
    expect(result.items[0].quantity).toBe(5)
  })
})

// ─── 2. Edge Cases ─────────────────────────────────────────────────────────────

describe("Edge Cases", () => {
  it("deberia_respetar_el_stock_maximo_al_acumular_cantidad", () => {
    const product = makeProduct({ stock: 5 }) // stock = 5
    const state = { items: [{ product, quantity: 4 }] }

    // Intentamos agregar 3 más — debe quedar en 5 (stock máximo)
    const result = cartReducer(state, { type: "ADD_ITEM", product, quantity: 3 })

    expect(result.items[0].quantity).toBe(5)
  })

  it("deberia_eliminar_el_item_si_UPDATE_QUANTITY_recibe_cero", () => {
    const result = cartReducer(stateWithOne, {
      type: "UPDATE_QUANTITY",
      productId: "p1",
      quantity: 0,
    })

    expect(result.items).toHaveLength(0)
  })

  it("deberia_eliminar_el_item_si_UPDATE_QUANTITY_recibe_numero_negativo", () => {
    const result = cartReducer(stateWithOne, {
      type: "UPDATE_QUANTITY",
      productId: "p1",
      quantity: -1,
    })

    expect(result.items).toHaveLength(0)
  })

  it("deberia_no_modificar_el_estado_si_REMOVE_ITEM_recibe_un_id_inexistente", () => {
    const result = cartReducer(stateWithOne, {
      type: "REMOVE_ITEM",
      productId: "id_que_no_existe",
    })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].product.id).toBe("p1")
  })

  it("deberia_no_modificar_otros_items_al_actualizar_uno_especifico", () => {
    const state = {
      items: [
        { product: makeProduct({ id: "p1" }), quantity: 1 },
        { product: makeProduct({ id: "p2", name: "Monitor" }), quantity: 3 },
      ],
    }
    const result = cartReducer(state, {
      type: "UPDATE_QUANTITY",
      productId: "p1",
      quantity: 9,
    })

    expect(result.items[0].quantity).toBe(9)
    expect(result.items[1].quantity).toBe(3) // no debe cambiar
  })

  it("deberia_agregar_producto_con_cantidad_1_cuando_se_agrega_por_primera_vez", () => {
    const product = makeProduct({ id: "nuevo" })
    const result = cartReducer(emptyState, { type: "ADD_ITEM", product, quantity: 1 })

    expect(result.items[0].quantity).toBe(1)
  })

  it("deberia_mantener_el_estado_sin_cambios_para_action_type_desconocido", () => {
    // @ts-expect-error — simulamos acción desconocida intencionalmente
    const result = cartReducer(stateWithOne, { type: "ACCION_INVENTADA" })

    expect(result).toEqual(stateWithOne)
  })
})

// ─── 3. Gestión de Errores ────────────────────────────────────────────────────

describe("Gestión de Errores", () => {
  it("deberia_retornar_carrito_vacio_al_hidratar_con_array_vacio", () => {
    const result = cartReducer(stateWithOne, { type: "HYDRATE", items: [] })

    expect(result.items).toHaveLength(0)
  })

  it("deberia_no_romper_si_REMOVE_ITEM_se_llama_en_carrito_vacio", () => {
    expect(() => {
      cartReducer(emptyState, { type: "REMOVE_ITEM", productId: "cualquier-id" })
    }).not.toThrow()
  })

  it("deberia_no_romper_si_CLEAR_CART_se_llama_en_carrito_ya_vacio", () => {
    expect(() => {
      cartReducer(emptyState, { type: "CLEAR_CART" })
    }).not.toThrow()

    const result = cartReducer(emptyState, { type: "CLEAR_CART" })
    expect(result.items).toHaveLength(0)
  })

  it("deberia_no_mutar_el_estado_original_al_agregar_item_inmutabilidad", () => {
    const original = { items: [{ product: makeProduct(), quantity: 1 }] }
    const originalLength = original.items.length

    cartReducer(original, {
      type: "ADD_ITEM",
      product: makeProduct({ id: "p2", name: "Teclado" }),
      quantity: 1,
    })

    // El estado original no debe haber mutado
    expect(original.items).toHaveLength(originalLength)
  })
})

// ─── 4. Integración / Cálculos derivados ──────────────────────────────────────

describe("Cálculos derivados (itemCount y subtotal)", () => {
  it("deberia_calcular_itemCount_como_suma_de_todas_las_cantidades", () => {
    const state = {
      items: [
        { product: makeProduct({ id: "p1", price: 100 }), quantity: 2 },
        { product: makeProduct({ id: "p2", price: 200 }), quantity: 3 },
      ],
    }
    const itemCount = state.items.reduce((acc, i) => acc + i.quantity, 0)
    expect(itemCount).toBe(5)
  })

  it("deberia_calcular_subtotal_como_precio_por_cantidad_de_cada_item", () => {
    const state = {
      items: [
        { product: makeProduct({ id: "p1", price: 100 }), quantity: 2 }, // 200
        { product: makeProduct({ id: "p2", price: 50 }), quantity: 4 },  // 200
      ],
    }
    const subtotal = state.items.reduce(
      (acc, i) => acc + i.product.price * i.quantity,
      0
    )
    expect(subtotal).toBe(400)
  })

  it("deberia_retornar_subtotal_cero_para_carrito_vacio", () => {
    const subtotal = emptyState.items.reduce(
      (acc, i) => acc + i.product.price * i.quantity,
      0
    )
    expect(subtotal).toBe(0)
  })
})
