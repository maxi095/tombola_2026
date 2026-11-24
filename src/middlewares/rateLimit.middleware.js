import rateLimit from 'express-rate-limit';

/**
 * Protección contra fuerza bruta en autenticación (/api/login y /api/register)
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos de acceso. Por favor esperá unos minutos e intentá nuevamente.',
  },
});

/**
 * Protección anti-scraping en búsqueda de asociados (RN-ROL-02)
 */
export const clientSearchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Límite de búsquedas alcanzado temporalmente. Intentá nuevamente en unos minutos.',
  },
});

/**
 * Límite general para protección básica de la API en Cloud
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  message: {
    message: 'Demasiadas solicitudes. Por favor intentá nuevamente en unos instantes.',
  },
});
