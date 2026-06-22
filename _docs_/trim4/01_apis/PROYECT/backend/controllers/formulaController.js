// controllers/formulaController.js
import Formula from '../models/Formula.js';
import sequelize from '../config/database.js';

// ============================================
// CLIENTE - SUBIR FÓRMULA
// ============================================
export const subirFormula = async (req, res) => {
  try {
    const { condicion, imagen_formula, observaciones } = req.body;
    const usuario = req.usuario; // Viene del authMiddleware

    // Validar campos requeridos
    if (!condicion || !imagen_formula) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: condicion, imagen_formula'
      });
    }

    // Validar condición
    const condicionesValidas = ['DALTONISMO', 'ASTIGMATISMO', 'MIOPIA', 'BAJA VISION'];
    if (!condicionesValidas.includes(condicion)) {
      return res.status(400).json({
        success: false,
        message: 'Condición inválida. Debe ser: DALTONISMO, ASTIGMATISMO, MIOPIA o BAJA VISION'
      });
    }

    // Crear la fórmula
    const nuevoId = await FormulaModelo.crear ({
      id_usuario: usuario.id_usuario,
      condicion,
      imagen_formula,
      observaciones: observaciones || null
    });

    const nuevaFormula = await FormulaModelo.obtenerPorId(nuevoId);

    res.status(201).json({
      success: true,
      message: 'Fórmula subida exitosamente. Esperando revisión del administrador',
      data: {
        id_formula: nuevaFormula.id_formula,
        condicion: nuevaFormula.condicion,
        estado: nuevaFormula.estado,
        costo: nuevaFormula.costo,
        fecha_creacion: nuevaFormula.fecha_creacion
      }
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

// ============================================
// CLIENTE - VER MIS FÓRMULAS
// ============================================
export const obtenerMisFormulas = async (req, res) => {
  try {
    const usuario = req.usuario;

    const formulas = await FormulaModelo.obtenerPorCliente(usuario.id_usuario);

    res.json({
      success: true,
      count: formulas.length,
      data: formulas
    });

  } catch (error) {
    console.error('Error al obtener fórmulas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus fórmulas',
      error: error.message
    });
  }
};

// ============================================
// CLIENTE/ADMIN - VER FÓRMULA POR ID
// ============================================
export const obtenerFormulaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const formula = await FormulaModelo.obtenerPorId(id);

    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Fórmula no encontrada'
      });
    }

    // ❌ ELIMINADO: Verificación manual de roles
    // ✅ Ahora solo verifica que sea el dueño o admin (adminMiddleware se encarga)

    // Verificar que el usuario sea el dueño de la fórmula
    if (formula.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta fórmula'
      });
    }

    res.json({
      success: true,
      data: formula
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

// ============================================
// ADMIN - VER TODAS LAS FÓRMULAS
// ============================================
export const obtenerTodasLasFormulas = async (req, res) => {
  try {
    const formulas = await FormulaModelo.obtenerTodas();

    res.json({
      success: true,
      count: formulas.length,
      data: formulas
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

// ============================================
// ADMIN - VER FÓRMULAS PENDIENTES
// ============================================
export const obtenerFormulasPendientes = async (req, res) => {
  try {
    const formulas = await FormulaModelo.obtenerPendientes();

    res.json({
      success: true,
      count: formulas.length,
      data: formulas
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

// ============================================
// ADMIN - ASIGNAR PRECIO A FÓRMULA
// ============================================
export const asignarPrecioFormula = async (req, res) => {
  try {
    const { id } = req.params;
    const { costo, estado } = req.body;

    // Validar campos requeridos
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

    // Verificar si la fórmula existe
    const formula = await FormulaModelo.obtenerPorId(id);
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Fórmula no encontrada'
      });
    }

    // Asignar precio
    const estadoFinal = estado || 'Aprobado';
    await FormulaModelo.asignarPrecio(id, costo, estadoFinal);

    const formulaActualizada = await FormulaModelo.obtenerPorId(id);

    res.json({
      success: true,
      message: `Precio asignado exitosamente. Estado: ${estadoFinal}`,
      data: formulaActualizada
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

// ============================================
// ADMIN - CAMBIAR ESTADO DE FÓRMULA
// ============================================
export const cambiarEstadoFormula = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    const estadosValidos = ['Pendiente', 'Aprobado', 'Rechazado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: Pendiente, Aprobado o Rechazado'
      });
    }

    // Verificar si la fórmula existe
    const formula = await FormulaModelo.obtenerPorId(id);
    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Fórmula no encontrada'
      });
    }

    // Cambiar estado
    await FormulaModelo.cambiarEstado(id, estado);

    const formulaActualizada = await FormulaModelo.obtenerPorId(id);

    res.json({
      success: true,
      message: `Estado actualizado a: ${estado}`,
      data: formulaActualizada
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

// ============================================
// CLIENTE - VER SI UNA FÓRMULA ESTÁ APROBADA
// ============================================
export const verificarFormulaAprobada = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const formula = await FormulaModelo.obtenerPorId(id);

    if (!formula) {
      return res.status(404).json({
        success: false,
        message: 'Fórmula no encontrada'
      });
    }

    // Verificar que la fórmula pertenece al usuario
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
        costo: formula.costo
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