// controllers/uploadController.js
import { subirImagenDesdeUrl, subirImagenDesdeArchivo, eliminarImagen } from '../utils/imageUtils.js';

/**
 * Subir imagen desde URL (para productos o fórmulas)
 * POST /api/upload/url
 */
export const subirImagenUrl = async (req, res) => {
  try {
    const { imageUrl, folder = 'opticam' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una URL de imagen'
      });
    }

    const resultado = await subirImagenDesdeUrl(imageUrl, folder);

    if (!resultado.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al subir la imagen',
        error: resultado.error
      });
    }

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        public_id: resultado.public_id,
        url: resultado.url
      }
    });

  } catch (error) {
    console.error('Error al subir imagen desde URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
};

/**
 * Subir imagen desde archivo (multipart/form-data)
 * POST /api/upload/archivo
 */
export const subirImagenArchivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se envió ningún archivo'
      });
    }

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        public_id: req.file.filename,
        url: req.file.path
      }
    });

  } catch (error) {
    console.error('Error al subir imagen desde archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
};

/**
 * Eliminar imagen de Cloudinary
 * DELETE /api/upload/:public_id
 */
export const eliminarImagenCloudinary = async (req, res) => {
  try {
    const { public_id } = req.params;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un public_id'
      });
    }

    const eliminado = await eliminarImagen(public_id);

    if (!eliminado) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar la imagen'
      });
    }

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen',
      error: error.message
    });
  }
};