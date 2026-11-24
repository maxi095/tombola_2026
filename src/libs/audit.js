import AuditLog from "../models/auditLog.model.js";

/**
 * Registra un evento de auditoría de forma no-bloqueante (fire-and-forget seguro).
 * Nunca interrumpe ni revierte la operación principal si falla el log.
 */
export const recordAudit = async ({
  req,
  action,
  entity,
  entityId = null,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actor: req?.user?.id || req?.user?._id || null,
      actorRole: req?.user?.roles || "Sistema",
      action,
      entity,
      entityId,
      metadata,
      ip: req?.ip || req?.headers?.["x-forwarded-for"] || "",
    });
  } catch (err) {
    console.error("⚠️ AuditLog warning (non-blocking):", err.message);
  }
};
