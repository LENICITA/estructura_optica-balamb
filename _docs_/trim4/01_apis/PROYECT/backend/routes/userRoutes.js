import express from 'express';
import {
    registrarCliente,
    registrarRepartidor,
    listarRepartidores,
    obtenerRepartidor,
    actualizarRepartidor,
    eliminarRepartidor,
    cambiarEstadoRepartidor,
    buscarRepartidores
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

//RUTAS PUBLICAS

//Registro Cliente
router.post('/registro', registrarCliente);

//PANEL DE CONTROL DE ADMIN PARA REPARTIDORES

//CREAR REPARTIDOR
router.post('/repartidores', authMiddleware, adminMiddleware, registrarRepartidor);

//LISTAR TODOS LOS REPARTIDORES
router.get('/repartidores', authMiddleware, adminMiddleware, listarRepartidores);

//BUSCAR REPARTIDORES CON FILTROS
router.get('/repartidores/buscar', authMiddleware, adminMiddleware, buscarRepartidores);

//OBTENER REPARTIDOR POR ID
router.get('/repartidores/:id', authMiddleware, adminMiddleware, obtenerRepartidor);

//ACTUALIZAR REPARTIDOR
router.put('/repartidores/:id', authMiddleware, adminMiddleware, actualizarRepartidor);

//CAMBIAR ESTADO DE REPARTIDOR
router.patch('/repartidores/:id/estado', authMiddleware, adminMiddleware, cambiarEstadoRepartidor);

//ELIMINAR REPARTIDOR
router.delete('/repartidores/:id', authMiddleware, adminMiddleware, eliminarRepartidor);

export default router;