import User from '../models/user.model.js';

/**
 * sellerScope.js - Middleware de Aislamiento de Cartera de Vendedor 🛡️
 * Garantiza que las consultas y mutaciones de un usuario con rol 'Vendedor'
 * queden estrictamente limitadas a su ficha de vendedor vinculada.
 */
export const sellerScope = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "No autenticado" });
        }

        if (user.roles === 'Vendedor') {
            let sellerId = user.seller;

            // Si el sellerId no vino en el token, se consulta en la base de datos
            if (!sellerId) {
                const userDoc = await User.findById(user.id || user._id).select('seller').lean();
                sellerId = userDoc?.seller;
            }

            if (!sellerId) {
                return res.status(403).json({
                    message: "Acceso denegado: el usuario vendedor no tiene una ficha de vendedor vinculada."
                });
            }

            req.sellerId = sellerId.toString();
        } else {
            // Administrador o Directiva operan sin restricción de vendedor propio
            req.sellerId = null;
        }

        next();
    } catch (error) {
        console.error("Error en sellerScope middleware:", error);
        return res.status(500).json({ message: "Error interno al validar ámbito de vendedor" });
    }
};
