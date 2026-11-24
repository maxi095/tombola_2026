import { describe, it, expect, vi } from "vitest";
import {
  calculateSellerPaymentSummary,
  calculateLotteryTax,
  isLotteryPaymentBalanced,
  evaluateDrawEligibility,
} from "../src/libs/businessRules.js";
import { checkRole } from "../src/middlewares/role.middleware.js";
import { sellerScope } from "../src/middlewares/sellerScope.js";

const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

describe("RN-REN-01 — Fórmulas de Rendición de Vendedores", () => {
  it("calcula subtotal bruto, comisión y neto a rendir incluyendo cheques", () => {
    const result = calculateSellerPaymentSummary({
      cashAmount: 50000,
      transferAmount: 30000,
      tarjetaUnicaAmount: 10000,
      checks: [{ amount: 5000 }, { amount: 5000 }],
      commissionRate: 15,
    });

    expect(result.checksTotal).toBe(10000);
    expect(result.grossSubtotal).toBe(100000);
    expect(result.commissionAmount).toBe(15000);
    expect(result.netToRender).toBe(85000);
  });
});

describe("§4.5 — Impuesto de Lotería de Córdoba", () => {
  it("calcula el 6.5420% y respeta la tolerancia de redondeo ±$0.02", () => {
    const tax = calculateLotteryTax(100000, 6.542);
    expect(tax).toBe(6542);
    expect(isLotteryPaymentBalanced(6542.01, tax)).toBe(true);
    expect(isLotteryPaymentBalanced(6542.05, tax)).toBe(false);
  });
});

describe("RN-SOR-01..04 — Elegibilidad y Wording Amigable en TV", () => {
  it("rechaza cartón no vendido sin usar la palabra Deuda", () => {
    const res = evaluateDrawEligibility({ sold: false, drawMode: "cuota" });
    expect(res.eligible).toBe(false);
    expect(res.reason).toBe("No participa – Solicitud no vendida");
    expect(res.reason.toLowerCase()).not.toContain("deuda");
  });

  it("rechaza cartón con cuotas vencidas en modo cuota al día", () => {
    const res = evaluateDrawEligibility({ sold: true, upToDate: false, drawMode: "cuota" });
    expect(res.eligible).toBe(false);
    expect(res.reason).toBe("No participa – Cuotas pendientes");
  });

  it("rechaza cartón al día pero no saldado 100% en modo contado", () => {
    const res = evaluateDrawEligibility({
      sold: true,
      upToDate: true,
      isFullPaid: false,
      drawMode: "contado",
    });
    expect(res.eligible).toBe(false);
    expect(res.reason).toBe("No participa – Pago de contado incompleto");
  });

  it("aprueba cartón saldado en modo contado", () => {
    const res = evaluateDrawEligibility({
      sold: true,
      upToDate: true,
      isFullPaid: true,
      drawMode: "contado",
    });
    expect(res.eligible).toBe(true);
  });
});

describe("RBAC Multi-Rol y Scoping de Vendedor (RN-ROL-01..09)", () => {
  it("bloquea con 403 a Vendedor intentando acceder a rutas solo-Administrador (ej. GET /api/clients)", () => {
    const req = { method: "GET", user: { id: "u1", roles: "Vendedor" } };
    const res = createMockRes();
    const next = vi.fn();

    checkRole(["Administrador"])(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("permite a Directiva realizar consultas GET pero bloquea mutaciones POST con 403", () => {
    const nextGet = vi.fn();
    checkRole(["Administrador", "Directiva"])(
      { method: "GET", user: { id: "d1", roles: "Directiva" } },
      createMockRes(),
      nextGet
    );
    expect(nextGet).toHaveBeenCalledTimes(1);

    const resPost = createMockRes();
    const nextPost = vi.fn();
    checkRole(["Administrador", "Directiva"])(
      { method: "POST", user: { id: "d1", roles: "Directiva" } },
      resPost,
      nextPost
    );
    expect(resPost.statusCode).toBe(403);
    expect(nextPost).not.toHaveBeenCalled();
  });

  it("inyecta req.sellerId desde el JWT para Vendedor en sellerScope", async () => {
    const req = { user: { id: "u1", roles: "Vendedor", seller: "seller-abc-123" } };
    const res = createMockRes();
    const next = vi.fn();

    await sellerScope(req, res, next);

    expect(req.sellerId).toBe("seller-abc-123");
    expect(next).toHaveBeenCalledTimes(1);
  });
});
