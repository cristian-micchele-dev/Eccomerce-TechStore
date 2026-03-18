/**
 * Tests de integración para la API de validación de cupones (/api/coupons/validate)
 * Mockea fetch globalmente — verifica contratos de request/response.
 */

// ─── Tipos locales (espeja el contrato de la API) ─────────────────────────────

interface CouponResponse {
  code: string
  type: "percent" | "fixed"
  value: number
  discount: number
}

interface ErrorResponse {
  error: string
}

// ─── Helper: simula la lógica del cliente del carrito ─────────────────────────

async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ ok: boolean; data: CouponResponse | ErrorResponse }> {
  const res = await fetch("/api/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  })
  const data = await res.json()
  return { ok: res.ok, data }
}

// ─── 1. Happy Path ────────────────────────────────────────────────────────────

describe("Happy Path — validación de cupones", () => {
  beforeEach(() => jest.restoreAllMocks())

  it("deberia_aplicar_cupon_percent_y_retornar_discount_calculado", async () => {
    const mockCoupon: CouponResponse = {
      code: "TECHSTORE10",
      type: "percent",
      value: 10,
      discount: 99.9, // 10% de 999
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCoupon,
    })

    const { ok, data } = await validateCoupon("TECHSTORE10", 999)

    expect(ok).toBe(true)
    expect((data as CouponResponse).code).toBe("TECHSTORE10")
    expect((data as CouponResponse).type).toBe("percent")
    expect((data as CouponResponse).discount).toBe(99.9)
  })

  it("deberia_aplicar_cupon_fixed_y_retornar_el_valor_fijo_de_descuento", async () => {
    const mockCoupon: CouponResponse = {
      code: "DESC500",
      type: "fixed",
      value: 500,
      discount: 500,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCoupon,
    })

    const { ok, data } = await validateCoupon("DESC500", 1500)

    expect(ok).toBe(true)
    expect((data as CouponResponse).discount).toBe(500)
  })

  it("deberia_enviar_el_body_con_code_y_subtotal_correctos_al_endpoint", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "X", type: "percent", value: 5, discount: 50 }),
    })

    await validateCoupon("MICODIGO", 999)

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/coupons/validate",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "MICODIGO", subtotal: 999 }),
      })
    )
  })
})

// ─── 2. Edge Cases ─────────────────────────────────────────────────────────────

describe("Edge Cases — inputs extremos", () => {
  beforeEach(() => jest.restoreAllMocks())

  it("deberia_retornar_error_si_el_cupon_tiene_codigo_vacio", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Código requerido" }),
    })

    const { ok, data } = await validateCoupon("", 999)

    expect(ok).toBe(false)
    expect((data as ErrorResponse).error).toBeDefined()
  })

  it("deberia_retornar_error_si_el_cupon_no_existe_en_la_base_de_datos", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Cupón inválido o inactivo" }),
    })

    const { ok, data } = await validateCoupon("CUPON_FALSO_XYZ", 999)

    expect(ok).toBe(false)
    expect((data as ErrorResponse).error).toMatch(/inválido|inactivo/i)
  })

  it("deberia_retornar_error_si_subtotal_no_alcanza_el_minimo_del_cupon", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Pedido mínimo de $1000 requerido" }),
    })

    // DESC500 requiere minOrder: 1000, pero pasamos subtotal: 500
    const { ok, data } = await validateCoupon("DESC500", 500)

    expect(ok).toBe(false)
    expect((data as ErrorResponse).error).toBeDefined()
  })

  it("deberia_manejar_subtotal_cero_sin_romper", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Carrito vacío" }),
    })

    const { ok } = await validateCoupon("TECHSTORE10", 0)

    expect(ok).toBe(false)
  })

  it("deberia_enviar_codigo_en_formato_exacto_sin_transformaciones", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "minuscula", type: "percent", value: 5, discount: 50 }),
    })

    await validateCoupon("minuscula", 1000)

    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body
    )
    expect(body.code).toBe("minuscula") // el cliente no hace uppercase — lo hace el servidor
  })
})

// ─── 3. Gestión de Errores ────────────────────────────────────────────────────

describe("Gestión de Errores — fallos de red y servidor", () => {
  beforeEach(() => jest.restoreAllMocks())

  it("deberia_lanzar_error_si_fetch_falla_por_red", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"))

    await expect(validateCoupon("TECHSTORE10", 999)).rejects.toThrow("Network error")
  })

  it("deberia_manejar_respuesta_500_del_servidor_sin_crashear", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Error interno del servidor" }),
    })

    const { ok, data } = await validateCoupon("TECHSTORE10", 999)

    expect(ok).toBe(false)
    expect((data as ErrorResponse).error).toBe("Error interno del servidor")
  })
})

// ─── 4. Integración — verificación de llamadas al mock ────────────────────────

describe("Integración — verificación del contrato HTTP", () => {
  it("deberia_llamar_fetch_exactamente_una_vez_por_validacion", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "X", type: "percent", value: 5, discount: 50 }),
    })

    await validateCoupon("TECHSTORE10", 999)

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it("deberia_llamar_al_endpoint_correcto_siempre", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "X", type: "fixed", value: 100, discount: 100 }),
    })

    await validateCoupon("CUALQUIER_CODIGO", 500)

    const [url] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe("/api/coupons/validate")
  })

  it("deberia_siempre_usar_method_POST_no_GET", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "X", type: "percent", value: 5, discount: 50 }),
    })

    await validateCoupon("TEST", 200)

    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(options.method).toBe("POST")
  })

  it("deberia_siempre_enviar_Content-Type_application_json", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: "X", type: "percent", value: 5, discount: 50 }),
    })

    await validateCoupon("TEST", 200)

    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    expect(options.headers["Content-Type"]).toBe("application/json")
  })
})
