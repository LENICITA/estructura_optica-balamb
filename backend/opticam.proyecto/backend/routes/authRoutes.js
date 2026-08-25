// backend/routes/authRoutes.js
import express from 'express';
import { 
    login,
    register,
    verifyToken, 
    logout,
    solicitarRecuperacion,
    verificarTokenRecuperacion,
    resetearPassword
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ============================================
// RUTAS PÚBLICAS (NO requieren autenticación)
// ============================================
router.post('/login', login);
router.post('/register', register);
router.post('/recuperar-password', solicitarRecuperacion);
router.get('/verificar-token/:token', verificarTokenRecuperacion);
router.post('/resetear-password', resetearPassword);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================
router.get('/verify', authMiddleware, verifyToken);
router.post('/logout', authMiddleware, logout);

export default router;