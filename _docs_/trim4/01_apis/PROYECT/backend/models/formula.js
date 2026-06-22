// models/Formula.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Formula = sequelize.define('Formula', {
  id_formula: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'USUARIOS',
      key: 'id_usuario'
    }
  },
  condicion: {
    type: DataTypes.ENUM('DALTONISMO', 'ASTIGMATISMO', 'MIOPIA', 'BAJA VISION'),
    allowNull: false
  },
  imagen_formula: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  observaciones: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  costo: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: null,
    validate: {
      min: {
        args: [0],
        msg: 'El costo no puede ser negativo'
      }
    }
  },
  estado: {
    type: DataTypes.STRING(45),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: {
        args: [['Pendiente', 'Aprobado', 'Rechazado']],
        msg: 'Estado inválido. Debe ser: Pendiente, Aprobado o Rechazado'
      }
    }
  }
}, {
  tableName: 'FORMULAS',
  timestamps: false
});

// ========== MÉTODOS DEL MODELO ==========
const FormulaModelo = {

  // ============================================
  // CLIENTE
  // ============================================

  // Crear una nueva fórmula (cliente sube)
  crear: async (data) => {
    const formula = await Formula.create({
      id_usuario: data.id_usuario,
      condicion: data.condicion,
      imagen_formula: data.imagen_formula,
      observaciones: data.observaciones || null,
      estado: 'Pendiente'
    });
    return formula.id_formula;
  },

  // Obtener fórmulas de un cliente específico
  obtenerPorCliente: async (id_usuario) => {
    const formulas = await Formula.findAll({
      where: { id_usuario },
      order: [['fecha_creacion', 'DESC']]
    });
    return formulas;
  },

  // Obtener fórmula por ID (cliente ve su fórmula)
  obtenerPorId: async (id_formula) => {
    const formula = await Formula.findByPk(id_formula);
    return formula;
  },

  // ============================================
  // ADMIN
  // ============================================

  // Obtener todas las fórmulas (admin ve todas)
  obtenerTodas: async () => {
    const formulas = await sequelize.query(
      `SELECT f.*, u.nombre_completo, u.email, u.telefono
       FROM FORMULAS f
       JOIN USUARIOS u ON f.id_usuario = u.id_usuario
       ORDER BY f.fecha_creacion DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return formulas;
  },

  // Obtener fórmulas pendientes (admin ve solo pendientes)
  obtenerPendientes: async () => {
    const formulas = await sequelize.query(
      `SELECT f.*, u.nombre_completo, u.email, u.telefono
       FROM FORMULAS f
       JOIN USUARIOS u ON f.id_usuario = u.id_usuario
       WHERE f.estado = 'Pendiente'
       ORDER BY f.fecha_creacion ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return formulas;
  },

  // Asignar precio a una fórmula (admin)
  asignarPrecio: async (id_formula, costo, estado) => {
    const formula = await Formula.findByPk(id_formula);
    if (!formula) return false;

    await formula.update({
      costo: costo,
      estado: estado || 'Aprobado'
    });
    return true;
  },

  // Cambiar estado de una fórmula (admin)
  cambiarEstado: async (id_formula, estado) => {
    const formula = await Formula.findByPk(id_formula);
    if (!formula) return false;

    await formula.update({ estado });
    return true;
  },

  // ============================================
  // UTILIDADES
  // ============================================

  // Verificar si una fórmula pertenece a un usuario
  perteneceAUsuario: async (id_formula, id_usuario) => {
    const formula = await Formula.findOne({
      where: {
        id_formula,
        id_usuario
      }
    });
    return !!formula;
  },

  // Verificar si una fórmula está aprobada
  estaAprobada: async (id_formula) => {
    const formula = await Formula.findByPk(id_formula);
    if (!formula) return false;
    return formula.estado === 'Aprobado';
  },

  // Obtener fórmulas por estado
  obtenerPorEstado: async (estado) => {
    const formulas = await Formula.findAll({
      where: { estado },
      order: [['fecha_creacion', 'DESC']]
    });
    return formulas;
  }
};

export default Formula;