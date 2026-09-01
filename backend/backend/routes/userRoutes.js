import express from 'express';
import {
    registrarCliente,
    registrarRepartidor,
    listarRepartidores,
    obtenerRepartidor,
    actualizarRepartidor,
    eliminarRepartidor,
    cambiarEstadoRepartidor,
    buscarRepartidores,
    obtenerPerfil,
    actualizarPerfil,
    contarClientes
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// RUTAS PÚBLICAS
// Registro Cliente
router.post('/registro', registrarCliente);
router.get('/clientes/count', authMiddleware, adminMiddleware, contarClientes);

// RUTAS DE PERFIL (requieren autenticación)
router.get('/perfil', authMiddleware, obtenerPerfil);
router.put('/perfil', authMiddleware, actualizarPerfil);

// PANEL DE CONTROL DE ADMIN PARA REPARTIDORES
// CREAR REPARTIDOR
router.post('/repartidores', authMiddleware, adminMiddleware, registrarRepartidor);

// LISTAR TODOS LOS REPARTIDORES
router.get('/repartidores', authMiddleware, adminMiddleware, listarRepartidores);

// BUSCAR REPARTIDORES CON FILTROS
router.get('/repartidores/buscar', authMiddleware, adminMiddleware, buscarRepartidores);

// OBTENER REPARTIDOR POR ID
router.get('/repartidores/:id', authMiddleware, adminMiddleware, obtenerRepartidor);

// ACTUALIZAR REPARTIDOR
router.put('/repartidores/:id', authMiddleware, adminMiddleware, actualizarRepartidor);

// CAMBIAR ESTADO DE REPARTIDOR
router.patch('/repartidores/:id/estado', authMiddleware, adminMiddleware, cambiarEstadoRepartidor);

// ELIMINAR REPARTIDOR
router.delete('/repartidores/:id', authMiddleware, adminMiddleware, eliminarRepartidor);

export default router;