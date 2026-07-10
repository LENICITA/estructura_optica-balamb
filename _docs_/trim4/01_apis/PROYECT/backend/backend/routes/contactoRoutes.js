import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { enviarMensaje } from '../controllers/contactoController.js';

const router = express.Router();

// Ruta pública (cualquiera puede enviar)
router.post('/', enviarMensaje);

export default router;