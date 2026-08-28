// backend/controllers/formulaController.js
import FormulaModelo from '../models/formula.js';
import { obtenerUrlImagen } from '../utils/imageUtils.js';
import cloudinary from '../config/cloudinary.js';

// ============================================
// CLIENTE - SUBIR FORMULA
// ============================================
export const subirFormula = async (req, res) => {
  try {
    const { condicion, observaciones } = req.body;
    const usuario = req.user;

    if (!condicion) {
      return res.status(400).json({
        success: false,
        message: 'El campo condicion es requerido'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'La imagen de la formula es requerida'
      });
    }

    const condicionesValidas = ['DALTONISMO', 'ASTIGMATISMO', 'MIOPIA', 'BAJA VISION'];
    if (!condicionesValidas.includes(condicion)) {
      return res.status(400).json({
        success: false,
        message: 'Condicion invalida'
      });
    }

    const nuevoId = await FormulaModelo.crear({
      id_usuario: usuario.id,
      condicion,
      imagen_formula: req.file.path,
      observaciones: observaciones || null
    });

    const nuevaFormula = await FormulaModelo.obtenerPorId(nuevoId);

    const formulaConImagen = {
      ...nuevaFormula,
      imagen_url: obtenerUrlImagen(nuevaFormula.imagen_formula, 400, 400)
    };

    res.status(201).json({
      success: true,
      message: 'Formula subida exitosamente. Esperando revision del administrador',
      data: formulaConImagen
    });

  } catch (error) {
    console.error('Error al subir formula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la formula',
      error: error.message
    });
  }
};

// ============================================
// CLIENTE - ELIMINAR SU FORMULA
// ============================================
export const eliminarFormula = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    const formula = await FormulaModelo.obtenerPorId(id);
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula no encontrada'
      });
    }

    if (formula.id_usuario !== usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No puedes eliminar una formula que no te pertenece'
      });
    }

    if (formula.estado !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes eliminar formulas en estado Pendiente'
      });
    }

    if (formula.imagen_formula) {
      try {
        const urlParts = formula.imagen_formula.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        await cloudinary.uploader.destroy(`opticam/formulas/${publicId}`);
      } catch (error) {
        console.log('Error al eliminar imagen:', error);
      }
    }

    await FormulaModelo.eliminar(id);

    res.json({
      success: true,
      message: 'Formula eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar formula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la formula',
      error: error.message
    });
  }
};

// ============================================
// CLIENTE - VER MIS FORMULAS
// ============================================
export const obtenerMisFormulas = async (req, res) => {
  try {
    const usuario = req.user;

    const formulas = await FormulaModelo.obtenerPorCliente(usuario.id);

    const formulasConImagen = formulas.map(f => ({
      ...f,
      imagen_url: obtenerUrlImagen(f.imagen_formula, 400, 400)
    }));

    res.json({
      success: true,
      count: formulasConImagen.length,
      data: formulasConImagen
    });

  } catch (error) {
    console.error('Error al obtener formulas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus formulas',
      error: error.message
    });
  }
};

// ============================================
// CLIENTE/ADMIN - VER FORMULA POR ID (CORREGIDO)
// ============================================
export const obtenerFormulaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    console.log('Usuario ID:', usuario.id);
    console.log('Roles del usuario:', JSON.stringify(usuario.roles, null, 2));

    const formula = await FormulaModelo.obtenerPorId(id);

    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula no encontrada'
      });
    }

    // Verificar si el usuario es ADMIN correctamente
    let esAdmin = false;
    if (Array.isArray(usuario.roles)) {
      esAdmin = usuario.roles.some(rol => {
        if (typeof rol === 'string') {
          return rol.toUpperCase() === 'ADMIN';
        }
        if (rol && typeof rol === 'object') {
          return rol.nombre?.toUpperCase() === 'ADMIN' || 
                 rol.rol?.toUpperCase() === 'ADMIN';
        }
        return false;
      });
    }

    console.log('Es Admin:', esAdmin);
    console.log('Usuario ID formula:', formula.id_usuario);

    if (!esAdmin && formula.id_usuario !== usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta formula'
      });
    }

    const formulaConImagen = {
      ...formula,
      imagen_url: obtenerUrlImagen(formula.imagen_formula, 400, 400)
    };

    res.json({
      success: true,
      data: formulaConImagen
    });

  } catch (error) {
    console.error('Error al obtener formula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la formula',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - VER TODAS LAS FORMULAS
// ============================================
export const obtenerTodasLasFormulas = async (req, res) => {
  try {
    const formulas = await FormulaModelo.obtenerTodas();

    const formulasConImagen = formulas.map(f => ({
      ...f,
      imagen_url: obtenerUrlImagen(f.imagen_formula, 400, 400)
    }));

    res.json({
      success: true,
      count: formulasConImagen.length,
      data: formulasConImagen
    });

  } catch (error) {
    console.error('Error al obtener formulas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las formulas',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - VER FORMULAS PENDIENTES
// ============================================
export const obtenerFormulasPendientes = async (req, res) => {
  try {
    const formulas = await FormulaModelo.obtenerPendientes();

    const formulasConImagen = formulas.map(f => ({
      ...f,
      imagen_url: obtenerUrlImagen(f.imagen_formula, 400, 400)
    }));

    res.json({
      success: true,
      count: formulasConImagen.length,
      data: formulasConImagen
    });

  } catch (error) {
    console.error('Error al obtener formulas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener formulas pendientes',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - ASIGNAR PRECIO A FORMULA
// ============================================
export const asignarPrecioFormula = async (req, res) => {
  try {
    const { id } = req.params;
    const { costo, estado } = req.body;

    if (costo === undefined || costo === null) {
      return res.status(400).json({
        success: false,
        message: 'El campo costo es requerido'
      });
    }

    if (costo < 0) {
      return res.status(400).json({
        success: false,
        message: 'El costo no puede ser negativo'
      });
    }

    const formula = await FormulaModelo.obtenerPorId(id);
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula no encontrada'
      });
    }

    const estadoFinal = estado || 'Aprobado';
    await FormulaModelo.asignarPrecio(id, costo, estadoFinal);

    const formulaActualizada = await FormulaModelo.obtenerPorId(id);

    const formulaConImagen = {
      ...formulaActualizada,
      imagen_url: obtenerUrlImagen(formulaActualizada.imagen_formula, 400, 400)
    };

    res.json({
      success: true,
      message: `Precio asignado exitosamente. Estado: ${estadoFinal}`,
      data: formulaConImagen
    });

  } catch (error) {
    console.error('Error al asignar precio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar precio a la formula',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - CAMBIAR ESTADO DE FORMULA
// ============================================
export const cambiarEstadoFormula = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Pendiente', 'Aprobado', 'Rechazado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado invalido. Debe ser: Pendiente, Aprobado o Rechazado'
      });
    }

    const formula = await FormulaModelo.obtenerPorId(id);
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula no encontrada'
      });
    }

    await FormulaModelo.cambiarEstado(id, estado);

    const formulaActualizada = await FormulaModelo.obtenerPorId(id);

    const formulaConImagen = {
      ...formulaActualizada,
      imagen_url: obtenerUrlImagen(formulaActualizada.imagen_formula, 400, 400)
    };

    res.json({
      success: true,
      message: `Estado actualizado a: ${estado}`,
      data: formulaConImagen
    });

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de la formula',
      error: error.message
    });
  }
};

// ============================================
// CLIENTE - VER SI UNA FORMULA ESTA APROBADA
// ============================================
export const verificarFormulaAprobada = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    const formula = await FormulaModelo.obtenerPorId(id);

    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Formula no encontrada'
      });
    }

    if (formula.id_usuario !== usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para verificar esta formula'
      });
    }

    const aprobada = formula.estado === 'Aprobado';

    res.json({
      success: true,
      data: {
        id_formula: formula.id_formula,
        aprobada: aprobada,
        estado: formula.estado,
        costo: formula.costo,
        imagen_url: obtenerUrlImagen(formula.imagen_formula, 400, 400)
      }
    });

  } catch (error) {
    console.error('Error al verificar formula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar la formula',
      error: error.message
    });
  }
};