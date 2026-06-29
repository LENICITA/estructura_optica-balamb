import FormulaModelo from '../models/formula.js';
import { obtenerUrlImagen } from '../utils/imageUtils.js';
import cloudinary from '../config/cloudinary.js';

// CLIENTE - SUBIR FÓRMULA
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
        message: 'La imagen de la fórmula es requerida'
      });
    }

    const condicionesValidas = ['DALTONISMO', 'ASTIGMATISMO', 'MIOPIA', 'BAJA VISION'];
    if (!condicionesValidas.includes(condicion)) {
      return res.status(400).json({
        success: false,
        message: 'Condición inválida'
      });
    }

    const nuevoId = await FormulaModelo.crear({
      id_usuario: usuario.id_usuario,
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
      message: 'Fórmula subida exitosamente. Esperando revisión del administrador',
      data: formulaConImagen
    });

  } catch (error) {
    console.error('Error al subir fórmula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la fórmula',
      error: error.message
    });
  }
};

// NUEVO: CLIENTE - ELIMINAR SU FÓRMULA

export const eliminarFormula = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    const formula = await FormulaModelo.obtenerPorId(id);
    
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Fórmula no encontrada'
      });
    }

    // Verificar que sea de este usuario
    if (formula.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No puedes eliminar una fórmula que no te pertenece'
      });
    }

    // Solo puede eliminar si está Pendiente
    if (formula.estado !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo puedes eliminar fórmulas en estado Pendiente'
      });
    }

    // ELIMINAR IMAGEN DE CLOUDINARY
  
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
      message: 'Fórmula eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar fórmula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la fórmula',
      error: error.message
    });
  }
};

// CLIENTE - VER MIS FÓRMULAS
export const obtenerMisFormulas = async (req, res) => {
  try {
    const usuario = req.user;

    console.log('Usuario:', usuario);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const formulas = await FormulaModelo.obtenerPorCliente(usuario.id);

    console.log(`${formulas.length} fórmulas encontradas`);

    const formulasConImagen = formulas.map(f => ({
      id: f.id_formula,
      condicion: f.condicion,
      observaciones: f.observaciones,
      imagen_formula: f.imagen_formula,
      imagen_url: obtenerUrlImagen(f.imagen_formula, 400, 400),
      fecha_creacion: f.fecha_creacion,
      estado: f.estado,
      costo: f.costo
    }));

    res.json({
      success: true,
      count: formulasConImagen.length,
      data: formulasConImagen
    });

  } catch (error) {
    console.error('Error al obtener fórmulas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus fórmulas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// CLIENTE/ADMIN - VER FÓRMULA POR ID
export const obtenerFormulaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    const formula = await FormulaModelo.obtenerPorId(id);

    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Fórmula no encontrada'
      });
    }

    if (formula.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta fórmula'
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
    console.error('Error al obtener fórmula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la fórmula',
      error: error.message
    });
  }
};

// ADMIN - VER TODAS LAS FÓRMULAS
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
    console.error('Error al obtener fórmulas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las fórmulas',
      error: error.message
    });
  }
};

// ADMIN - VER FÓRMULAS PENDIENTES
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
    console.error('Error al obtener fórmulas pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener fórmulas pendientes',
      error: error.message
    });
  }
};

// ADMIN - ASIGNAR PRECIO A FÓRMULA
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
        message: 'Fórmula no encontrada'
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
      message: 'Error al asignar precio a la fórmula',
      error: error.message
    });
  }
};

// ADMIN - CAMBIAR ESTADO DE FÓRMULA
export const cambiarEstadoFormula = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Pendiente', 'Aprobado', 'Rechazado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: Pendiente, Aprobado o Rechazado'
      });
    }

    const formula = await FormulaModelo.obtenerPorId(id);
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Fórmula no encontrada'
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
      message: 'Error al cambiar estado de la fórmula',
      error: error.message
    });
  }
};

// CLIENTE - VER SI UNA FÓRMULA ESTÁ APROBADA
export const verificarFormulaAprobada = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    const formula = await FormulaModelo.obtenerPorId(id);

    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Fórmula no encontrada'
      });
    }

    if (formula.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para verificar esta fórmula'
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
    console.error('Error al verificar fórmula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar la fórmula',
      error: error.message
    });
  }
};