/**
 * Reglas de Negocio Puras — Gestión Tómbola (SYSTEM_BLUEPRINT.md §4)
 * Funciones deterministas testeables para contabilidad y sorteos en vivo.
 */

/**
 * RN-REN-01: Cálculo oficial de rendición de vendedor
 */
export function calculateSellerPaymentSummary({
  cashAmount = 0,
  transferAmount = 0,
  tarjetaUnicaAmount = 0,
  checks = [],
  commissionRate = 0,
}) {
  const checksTotal = (checks || []).reduce(
    (sum, c) => sum + (Number(c.amount) || 0),
    0
  );
  const grossSubtotal =
    (Number(cashAmount) || 0) +
    (Number(transferAmount) || 0) +
    (Number(tarjetaUnicaAmount) || 0) +
    checksTotal;
  const commissionAmount = Number(
    ((grossSubtotal * (Number(commissionRate) || 0)) / 100).toFixed(2)
  );
  const netToRender = Number((grossSubtotal - commissionAmount).toFixed(2));

  return {
    checksTotal,
    grossSubtotal,
    commissionAmount,
    netToRender,
  };
}

/**
 * §4.5: Cálculo de Impuesto de Lotería de la Provincia de Córdoba S.E.
 */
export function calculateLotteryTax(totalRenderedAmount, taxPercentage = 6.542) {
  const calculated = Number(
    (((Number(totalRenderedAmount) || 0) * Number(taxPercentage)) / 100).toFixed(2)
  );
  return calculated;
}

export function isLotteryPaymentBalanced(paidTotal, expectedTax, tolerance = 0.02) {
  return Math.abs((Number(paidTotal) || 0) - (Number(expectedTax) || 0)) <= tolerance;
}

/**
 * RN-SOR-01..04: Elegibilidad de cartón en Sorteo TV (cuota al día vs contado)
 */
export function evaluateDrawEligibility({
  sold = false,
  upToDate = false,
  isFullPaid = false,
  drawMode = "cuota", // 'cuota' | 'contado'
}) {
  if (!sold) {
    return {
      eligible: false,
      reason: "No participa – Solicitud no vendida",
    };
  }

  if (drawMode === "contado") {
    if (!isFullPaid) {
      return {
        eligible: false,
        reason: "No participa – Pago de contado incompleto",
      };
    }
    return { eligible: true, reason: "Participa" };
  }

  // Modo 'cuota' (Cuota al Día)
  if (!upToDate) {
    return {
      eligible: false,
      reason: "No participa – Cuotas pendientes",
    };
  }

  return { eligible: true, reason: "Participa" };
}
