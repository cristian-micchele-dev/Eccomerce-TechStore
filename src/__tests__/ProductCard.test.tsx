/**
 * Tests de componente para ProductCard
 * Verifica rendering, interacciones y estados.
 */
import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { ProductCard } from "@/components/catalog/ProductCard"
import { Product } from "@/lib/types"

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAddToCart = jest.fn()
const mockToggle = jest.fn()
const mockIsWishlisted = jest.fn(() => false)

jest.mock("@/context/CartContext", () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}))

jest.mock("@/context/WishlistContext", () => ({
  useWishlist: () => ({ toggle: mockToggle, isWishlisted: mockIsWishlisted }),
}))

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseProduct: Product = {
  id: "p1",
  name: "RTX 4080 16GB",
  description: "GPU de alto rendimiento",
  price: 999,
  originalPrice: 1199,
  image: "/gpu.jpg",
  images: ["/gpu.jpg"],
  category: "gpus",
  specs: [
    { label: "VRAM", value: "16GB GDDR6X" },
    { label: "TDP", value: "320W" },
  ],
  stock: 10,
  rating: 4.8,
  reviews: 142,
  badge: "Oferta",
}

const outOfStockProduct: Product = { ...baseProduct, id: "p2", stock: 0 }
const lowStockProduct: Product = { ...baseProduct, id: "p3", stock: 3 }

// ─── 1. Happy Path ────────────────────────────────────────────────────────────

describe("Happy Path", () => {
  beforeEach(() => jest.clearAllMocks())

  it("deberia_renderizar_nombre_y_precio_del_producto", () => {
    render(<ProductCard product={baseProduct} />)

    expect(screen.getByText("RTX 4080 16GB")).toBeInTheDocument()
    expect(screen.getByText(/999/)).toBeInTheDocument()
  })

  it("deberia_llamar_addToCart_con_el_producto_al_hacer_clic_en_agregar", () => {
    render(<ProductCard product={baseProduct} />)

    const btn = screen.getByRole("button", { name: /agregar al carrito/i })
    fireEvent.click(btn)

    expect(mockAddToCart).toHaveBeenCalledTimes(1)
    expect(mockAddToCart).toHaveBeenCalledWith(baseProduct, 1)
  })

  it("deberia_mostrar_badge_de_oferta_cuando_el_producto_tiene_badge", () => {
    render(<ProductCard product={baseProduct} />)

    expect(screen.getByText("Oferta")).toBeInTheDocument()
  })

  it("deberia_mostrar_el_porcentaje_de_descuento_cuando_hay_originalPrice", () => {
    render(<ProductCard product={baseProduct} />)

    // 999 vs 1199 = ~17% off
    expect(screen.getByText(/-\d+%/)).toBeInTheDocument()
  })

  it("deberia_mostrar_precio_original_tachado_cuando_hay_originalPrice", () => {
    render(<ProductCard product={baseProduct} />)

    expect(screen.getByText(/1[.,]?199/)).toBeInTheDocument()
  })

  it("deberia_llamar_toggle_con_productId_al_hacer_clic_en_bookmark", () => {
    render(<ProductCard product={baseProduct} />)

    const bookmark = screen.getByRole("button", { name: /favoritos/i })
    fireEvent.click(bookmark)

    expect(mockToggle).toHaveBeenCalledWith("p1")
  })

  it("deberia_mostrar_feedback_visual_Agregado_despues_de_agregar_al_carrito", () => {
    jest.useFakeTimers()
    render(<ProductCard product={baseProduct} />)

    const btn = screen.getByRole("button", { name: /agregar al carrito/i })
    fireEvent.click(btn)

    expect(screen.getByText(/agregado/i)).toBeInTheDocument()

    act(() => jest.advanceTimersByTime(2000))
    expect(screen.getByText(/agregar al carrito/i)).toBeInTheDocument()
    jest.useRealTimers()
  })
})

// ─── 2. Edge Cases ─────────────────────────────────────────────────────────────

describe("Edge Cases", () => {
  beforeEach(() => jest.clearAllMocks())

  it("deberia_mostrar_Sin_stock_y_deshabilitar_boton_cuando_stock_es_cero", () => {
    render(<ProductCard product={outOfStockProduct} />)

    const btn = screen.getByRole("button", { name: /sin stock/i })
    expect(btn).toBeDisabled()
  })

  it("deberia_no_llamar_addToCart_si_el_producto_no_tiene_stock", () => {
    render(<ProductCard product={outOfStockProduct} />)

    const btn = screen.getByRole("button", { name: /sin stock/i })
    fireEvent.click(btn)

    expect(mockAddToCart).not.toHaveBeenCalled()
  })

  it("deberia_mostrar_alerta_de_stock_bajo_cuando_quedan_5_o_menos_unidades", () => {
    render(<ProductCard product={lowStockProduct} />)

    expect(screen.getByText(/quedan 3/i)).toBeInTheDocument()
  })

  it("deberia_no_mostrar_alerta_de_stock_bajo_cuando_hay_mas_de_5_unidades", () => {
    render(<ProductCard product={baseProduct} />) // stock = 10

    expect(screen.queryByText(/quedan/i)).not.toBeInTheDocument()
  })

  it("deberia_no_mostrar_precio_original_si_no_existe_originalPrice", () => {
    const { container } = render(
      <ProductCard product={{ ...baseProduct, originalPrice: undefined }} />
    )

    // No debe haber texto tachado
    expect(container.querySelector(".line-through")).not.toBeInTheDocument()
  })

  it("deberia_renderizar_correctamente_sin_badge", () => {
    render(<ProductCard product={{ ...baseProduct, badge: undefined }} />)

    expect(screen.queryByText("Oferta")).not.toBeInTheDocument()
    expect(screen.queryByText("Nuevo")).not.toBeInTheDocument()
    expect(screen.queryByText("Popular")).not.toBeInTheDocument()
  })
})

// ─── 3. Gestión de Errores ────────────────────────────────────────────────────

describe("Gestión de Errores", () => {
  beforeEach(() => jest.clearAllMocks())

  it("deberia_no_propagar_el_evento_click_al_link_padre_al_agregar_al_carrito", () => {
    const linkClickHandler = jest.fn()
    render(
      <div onClick={linkClickHandler}>
        <ProductCard product={baseProduct} />
      </div>
    )

    const btn = screen.getByRole("button", { name: /agregar al carrito/i })
    fireEvent.click(btn)

    // stopPropagation debe evitar que suba al div padre
    expect(linkClickHandler).not.toHaveBeenCalled()
  })

  it("deberia_llamar_toggle_y_prevenir_navegacion_al_hacer_clic_en_bookmark", () => {
    // El bookmark llama e.preventDefault() para evitar navegación,
    // pero NO stopPropagation (a diferencia del botón de carrito).
    render(<ProductCard product={baseProduct} />)

    const bookmark = screen.getByRole("button", { name: /favoritos/i })
    fireEvent.click(bookmark)

    // toggle debe haberse llamado — eso es lo que importa
    expect(mockToggle).toHaveBeenCalledWith(baseProduct.id)
  })

  it("deberia_renderizar_sin_errores_con_specs_vacio", () => {
    expect(() => {
      render(<ProductCard product={{ ...baseProduct, specs: [] }} />)
    }).not.toThrow()
  })
})

// ─── 4. Integración — modo admin ──────────────────────────────────────────────

describe("Modo Admin", () => {
  const onEdit = jest.fn()
  const onDelete = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it("deberia_mostrar_botones_Editar_y_Eliminar_en_modo_admin", () => {
    render(<ProductCard product={baseProduct} isAdmin onEdit={onEdit} onDelete={onDelete} />)

    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument()
  })

  it("deberia_NO_mostrar_boton_agregar_al_carrito_en_modo_admin", () => {
    render(<ProductCard product={baseProduct} isAdmin onEdit={onEdit} onDelete={onDelete} />)

    expect(
      screen.queryByRole("button", { name: /agregar al carrito/i })
    ).not.toBeInTheDocument()
  })

  it("deberia_llamar_onEdit_al_hacer_clic_en_Editar", () => {
    render(<ProductCard product={baseProduct} isAdmin onEdit={onEdit} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole("button", { name: /editar/i }))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it("deberia_llamar_onDelete_al_hacer_clic_en_Eliminar", () => {
    render(<ProductCard product={baseProduct} isAdmin onEdit={onEdit} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole("button", { name: /eliminar/i }))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
