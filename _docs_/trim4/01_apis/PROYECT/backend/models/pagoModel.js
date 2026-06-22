
import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';

const Pago = sequelize.define('Pago', {

  id_pago: {                                   // ← AGREGAR ESTO
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
id_pedido: {
  type: DataTypes.INTEGER,
  allowNull: false        // ← REQUERIDO
},
fecha_pago: {
  type: DataTypes.DATEONLY,
  allowNull: false,       // ← REQUERIDO (con defaultValue ya tiene valor)
  defaultValue: DataTypes.NOW
},
eleccion_pago: {
  type: DataTypes.STRING(45),
  allowNull: false,       // ← REQUERIDO
  validate: {
    isIn: {
      args: [['50%', '100%']],
      msg: 'Elección de pago debe ser 50% o 100%'
    }
  }
},
canal_pago: {
  type: DataTypes.STRING(45),
  allowNull: false,       // ← REQUERIDO (con defaultValue ya tiene valor)
  defaultValue: 'Bold'
},
monto: {
  type: DataTypes.FLOAT,
  allowNull: false,       // ← REQUERIDO
  validate: {
    min: {
      args: [0.01],
      msg: 'El monto debe ser mayor a 0'
    }
  }
},
estado: {
  type: DataTypes.STRING(45),
  allowNull: false,       // ← REQUERIDO (con defaultValue ya tiene valor)
  defaultValue: 'Pendiente',
  validate: {
    isIn: {
      args: [['Pendiente', 'Confirmado', 'Rechazado']],
      msg: 'Estado inválido'
    }
  }
}
}, {
  tableName: 'PAGOS',
  timestamps: false
});

const PagoModel = {

  // ============================================
  // CLIENTE
  // ============================================

  crear: async (data) => {
    const pago = await Pago.create({
      id_pedido: data.id_pedido,
      eleccion_pago: data.eleccion_pago,
      canal_pago: data.canal_pago || 'Bold',
      monto: data.monto,
      estado: 'Pendiente'
    });
    return pago.id_pago;
  },

  obtenerPorPedido: async (id_pedido) => {
    const pagos = await Pago.findAll({
      where: { id_pedido },
      order: [['fecha_pago', 'DESC']]
    });
    return pagos;
  },

  obtenerPorId: async (id_pago) => {
    const pago = await Pago.findByPk(id_pago);
    return pago;
  },

  // ============================================
  // BOLD (webhook)
  // ============================================

  confirmarPago: async (id_pago) => {
    const pago = await Pago.findByPk(id_pago);
    if (!pago) return false;
    await pago.update({ estado: 'Confirmado' });
    
    // ===== LÓGICA PARA 50% y 100% =====
    if (pago.eleccion_pago === '100%') {
      // Pago completo → pedido Pagado
      await sequelize.query(
        'UPDATE PEDIDOS SET estado = "Pagado" WHERE id_pedido = ?',
        { replacements: [pago.id_pedido] }
      );
    } else if (pago.eleccion_pago === '50%') {
      // Abono del 50% → pedido Abonado
      await sequelize.query(
        'UPDATE PEDIDOS SET estado = "Abonado" WHERE id_pedido = ?',
        { replacements: [pago.id_pedido] }
      );
    }
    return true;
  },

  rechazarPago: async (id_pago) => {
    const pago = await Pago.findByPk(id_pago);
    if (!pago) return false;
    await pago.update({ estado: 'Rechazado' });
    return true;
  },

  // ============================================
  // ADMIN (solo consultas)
  // ============================================

  obtenerTodos: async () => {
    const pagos = await sequelize.query(
      `SELECT p.*, pe.total as total_pedido
       FROM PAGOS p
       JOIN PEDIDOS pe ON p.id_pedido = pe.id_pedido
       ORDER BY p.fecha_pago DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return pagos;
  },

  obtenerEstadisticas: async () => {
    const [stats] = await sequelize.query(
      `SELECT 
        SUM(CASE WHEN estado = 'Confirmado' THEN monto ELSE 0 END) as total_recaudado,
        SUM(CASE WHEN estado = 'Pendiente' THEN monto ELSE 0 END) as total_pendiente,
        COUNT(CASE WHEN estado = 'Confirmado' THEN 1 END) as pagos_confirmados,
        COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as pagos_pendientes,
        COUNT(CASE WHEN estado = 'Rechazado' THEN 1 END) as pagos_rechazados,
        SUM(CASE WHEN estado = 'Confirmado' AND eleccion_pago = '50%' THEN monto ELSE 0 END) as total_abonos_50,
        SUM(CASE WHEN estado = 'Confirmado' AND eleccion_pago = '100%' THEN monto ELSE 0 END) as total_pagos_completos
       FROM PAGOS`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return stats;
  },

  obtenerPorRangoFechas: async (fechaInicio, fechaFin) => {
    const pagos = await Pago.findAll({
      where: {
        fecha_pago: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      order: [['fecha_pago', 'DESC']]
    });
    return pagos;
  },

  // ============================================
  // UTILIDADES
  // ============================================

  obtenerTotalPagado: async (id_pedido) => {
    const [result] = await sequelize.query(
      `SELECT SUM(monto) as total_pagado 
       FROM PAGOS 
       WHERE id_pedido = ? AND estado = 'Confirmado'`,
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    return parseFloat(result?.total_pagado) || 0;
  },

  tienePagoCompleto: async (id_pedido) => {
    const [pago] = await sequelize.query(
      `SELECT * FROM PAGOS 
       WHERE id_pedido = ? AND estado = 'Confirmado' AND eleccion_pago = '100%'`,
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    return !!pago;
  },

  tieneAbono50: async (id_pedido) => {
    const [pago] = await sequelize.query(
      `SELECT * FROM PAGOS 
       WHERE id_pedido = ? AND estado = 'Confirmado' AND eleccion_pago = '50%'`,
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    return !!pago;
  },

  // ✅ NUEVO: Verificar si el pedido tiene pago completo (suma de abonos)
  tienePagoCompletoPorSuma: async (id_pedido) => {
    const [pedido] = await sequelize.query(
      'SELECT total FROM PEDIDOS WHERE id_pedido = ?',
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    if (!pedido) return false;

    const totalPagado = await PagoModel.obtenerTotalPagado(id_pedido);
    return totalPagado >= pedido.total;
  }
};

export default PagoModel;