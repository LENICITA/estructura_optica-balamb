import express from 'express';
import { enviarMensaje } from '../controllers/contactoController.js';

const router = express.Router();


router.post('/', enviarMensaje);

export default router;