/**
 * role.middleware.js - Control de Acceso Basado en Roles (RBAC) 🛡️
 * Valida que el usuario autenticado posea uno de los roles permitidos.
 */
export const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !user.roles) {
            return res.status(403).json({ message: "Acceso denegado: sin roles autorizados." });
        }

        const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        // Directiva: Solo lectura (RN-ROL-06)
        if (user.roles === 'Directiva' && req.method !== 'GET') {
            return res.status(403).json({ message: "Acceso denegado: el rol Directiva posee acceso de solo lectura." });
        }

        const hasRole = allowed.includes(user.roles);

        if (!hasRole) {
            return res.status(403).json({ message: "Acceso denegado: no posee el rol requerido para esta acción." });
        }

        next();
    };
};

export const requireRoles = (...roles) => checkRole(roles);
