import { Router } from 'express';
import { login, logout, register, profile, verifyToken } from '../controllers/auth.controllers.js';
import { authRequired } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validator.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { loginLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post('/register', loginLimiter, validateSchema(registerSchema), register);

router.post('/login', loginLimiter, validateSchema(loginSchema), login);

router.post('/logout', logout);

router.get('/verify', verifyToken);

router.get('/profile', authRequired, profile);

export default router;
