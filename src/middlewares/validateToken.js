import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

export const authRequired = (req, res, next) => {
    // Soporte dual: Cookie httpOnly o Header 'Authorization: Bearer <token>' para PWA/Mobile
    const token = req.cookies?.token || 
        (req.headers.authorization?.startsWith('Bearer ') 
            ? req.headers.authorization.split(' ')[1] 
            : null);

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    jwt.verify(token, TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        req.user = user;
        next();
    });
};
