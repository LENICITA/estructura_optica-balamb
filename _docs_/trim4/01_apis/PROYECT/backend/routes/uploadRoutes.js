// routes/uploadRoutes.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import {
  subirImagenUrl,
  subirImagenArchivo,
  eliminarImagenCloudinary
} from '../controllers/uploadController.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Subir imagen desde URL (POST con JSON)
router.post('/url', authMiddleware, adminMiddleware, subirImagenUrl);

// Subir imagen desde archivo (multipart/form-data)
router.post('/archivo', authMiddleware, adminMiddleware, upload.single('imagen'), subirImagenArchivo);

// Eliminar imagen
router.delete('/:public_id', authMiddleware, adminMiddleware, eliminarImagenCloudinary);

export default router;