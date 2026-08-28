import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import upload from '../middlewares/upload.js';
import * as formulaController from '../controllers/formulaController.js';

const router = express.Router();

// ============================================
// RUTAS PARA CLIENTE (requieren token)
// ============================================

// Subir formula (cliente)
router.post('/', authMiddleware, upload.single('imagen'), formulaController.subirFormula);

// Eliminar formula (cliente dueño)
router.delete('/:id', authMiddleware, formulaController.eliminarFormula);

// Ver mis formulas (cliente)
router.get('/mis-formulas', authMiddleware, formulaController.obtenerMisFormulas);

// Ver formula por ID (cliente dueño O ADMIN)
router.get('/:id', authMiddleware, adminMiddleware, formulaController.obtenerFormulaPorId);

// Verificar si formula esta aprobada (cliente dueño)
router.get('/:id/verificar', authMiddleware, formulaController.verificarFormulaAprobada);

// ============================================
// RUTAS PARA ADMIN (requieren token + admin)
// ============================================

// Ver todas las formulas (admin)
router.get('/admin/todas', authMiddleware, adminMiddleware, formulaController.obtenerTodasLasFormulas);

// Ver formulas pendientes (admin)
router.get('/admin/pendientes', authMiddleware, adminMiddleware, formulaController.obtenerFormulasPendientes);

// Asignar precio a formula (admin)
router.put('/:id/precio', authMiddleware, adminMiddleware, formulaController.asignarPrecioFormula);

// Cambiar estado de formula (admin)
router.put('/:id/estado', authMiddleware, adminMiddleware, formulaController.cambiarEstadoFormula);

export default router;