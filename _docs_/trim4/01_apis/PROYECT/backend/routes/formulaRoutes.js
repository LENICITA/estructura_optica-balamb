// routes/formulaRoutes.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import * as formulaController from '../controllers/formulaController.js';

const router = express.Router();

// ============================================
// RUTAS PARA CLIENTE (requieren token)
// ============================================

// Subir fórmula (cliente)
router.post('/', authMiddleware, formulaController.subirFormula);

// Ver mis fórmulas (cliente)
router.get('/mis-formulas', authMiddleware, formulaController.obtenerMisFormulas);

// Ver fórmula por ID (cliente dueño)
router.get('/:id', authMiddleware, formulaController.obtenerFormulaPorId);

// Verificar si fórmula está aprobada (cliente dueño)
router.get('/:id/verificar', authMiddleware, formulaController.verificarFormulaAprobada);

// ============================================
// RUTAS PARA ADMIN (requieren token + admin)
// ============================================

// Ver todas las fórmulas (admin)
router.get('/admin/todas', authMiddleware, adminMiddleware, formulaController.obtenerTodasLasFormulas);

// Ver fórmulas pendientes (admin)
router.get('/admin/pendientes', authMiddleware, adminMiddleware, formulaController.obtenerFormulasPendientes);

// Asignar precio a fórmula (admin)
router.put('/:id/precio', authMiddleware, adminMiddleware, formulaController.asignarPrecioFormula);

// Cambiar estado de fórmula (admin)
router.put('/:id/estado', authMiddleware, adminMiddleware, formulaController.cambiarEstadoFormula);

export default router;