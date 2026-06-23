// models/pagoModel.js
import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';

// ============================================
// MODELO PAGOS
// ============================================
const Pago = sequelize.define('Pago', {
  id_pago: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_pedido: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PEDIDOS',
      key: 'id_pedido'
    }
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  eleccion_pago: {
    type: DataTypes.ENUM('50%', '100%'),
    allowNull: false
  },
  canal_pago: {
    type: DataTypes.ENUM('Bold'),
    allowNull: false,
    defaultValue: 'Bold'
  },
  monto: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'El monto debe ser mayor a 0'
      }
    }
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Confirmado', 'Rechazado'),
    allowNull: false,
    defaultValue: 'Pendiente'
  }
}, {
  tableName: 'PAGOS',
  timestamps: false
});

// ============================================
// MÉTODOS DEL MODELO
// ============================================
const PagoModel = {

  // ==========================================
  // CLIENTE
  // ==========================================

  // Crear un nuevo pago
  
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

  //  Obtener pagos de un pedido
  
  obtenerPorPedido: async (id_pedido) => {
    const pagos = await Pago.findAll({
      where: { id_pedido },
      order: [['fecha_pago', 'DESC']]
    });
    return pagos;
  },

  //  Obtener pago por ID
  
  obtenerPorId: async (id_pago) => {
    const pago = await Pago.findByPk(id_pago);
    return pago;
  },

  // ==========================================
  // BOLD (webhook)
  // ==========================================

  /**
   * Bold confirma el pago
   * - Si es 100% → pedido a Pagado
   * - Si es 50% y es el primer pago → pedido a Abonado
   * - Si es 50% y ya tiene abono previo → pedido a Pagado (saldo restante)
   */
  confirmarPago: async (id_pago) => {
    const pago = await Pago.findByPk(id_pago);
    if (!pago) return false;
    
    await pago.update({ estado: 'Confirmado' });

    // Verificar si ya tiene un abono del 50% previo (excluyendo el pago actual)
    const [abonosPrevios] = await sequelize.query(
      `SELECT * FROM PAGOS 
       WHERE id_pedido = ? 
       AND estado = 'Confirmado' 
       AND eleccion_pago = '50%'
       AND id_pago != ?`,
      { replacements: [pago.id_pedido, pago.id_pago] }
    );
    
    const tieneAbonoPrevio = abonosPrevios && abonosPrevios.length > 0;

    // Lógica para actualizar estado del pedido
    if (pago.eleccion_pago === '100%') {
      // Pago completo de una vez → Pagado
      await sequelize.query(
        'UPDATE PEDIDOS SET estado = "Pagado" WHERE id_pedido = ?',
        { replacements: [pago.id_pedido] }
      );
    } else if (pago.eleccion_pago === '50%' && tieneAbonoPrevio) {
      // Segundo pago del 50% (saldo restante) → Pagado
      await sequelize.query(
        'UPDATE PEDIDOS SET estado = "Pagado" WHERE id_pedido = ?',
        { replacements: [pago.id_pedido] }
      );
    } else if (pago.eleccion_pago === '50%' && !tieneAbonoPrevio) {
      // Primer pago del 50% (abono inicial) → Abonado
      await sequelize.query(
        'UPDATE PEDIDOS SET estado = "Abonado" WHERE id_pedido = ?',
        { replacements: [pago.id_pedido] }
      );
    }
    return true;
  },

  // Bold rechaza el pago
   
  rechazarPago: async (id_pago) => {
    const pago = await Pago.findByPk(id_pago);
    if (!pago) return false;
    await pago.update({ estado: 'Rechazado' });
    return true;
  },

  // ==========================================
  // ADMIN (solo consultas)
  // ==========================================

  // Obtener todos los pagos
   
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

  // Obtener estadísticas de pagos
   
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

  // Obtener pagos por rango de fechas
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

  // ==========================================
  // UTILIDADES
  // ==========================================

  // Obtener total pagado de un pedido (suma de todos los pagos confirmados)
   
  obtenerTotalPagado: async (id_pedido) => {
    const [result] = await sequelize.query(
      `SELECT SUM(monto) as total_pagado 
       FROM PAGOS 
       WHERE id_pedido = ? AND estado = 'Confirmado'`,
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    return parseFloat(result?.total_pagado) || 0;
  },

  //Verificar si el pedido tiene un pago completo (100%)
  
  tienePagoCompleto: async (id_pedido) => {
    const [pago] = await sequelize.query(
      `SELECT * FROM PAGOS 
       WHERE id_pedido = ? AND estado = 'Confirmado' AND eleccion_pago = '100%'`,
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    return !!pago;
  },

  // Verificar si el pedido tiene un abono del 50%
  
  tieneAbono50: async (id_pedido) => {
    const [pago] = await sequelize.query(
      `SELECT * FROM PAGOS 
       WHERE id_pedido = ? AND estado = 'Confirmado' AND eleccion_pago = '50%'`,
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    return !!pago;
  },

  /**
   * Verificar si el pedido tiene pago completo por suma de abonos
   * (suma de todos los pagos confirmados >= total del pedido)
   */
  tienePagoCompletoPorSuma: async (id_pedido) => {
    const [pedido] = await sequelize.query(
      'SELECT total FROM PEDIDOS WHERE id_pedido = ?',
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    if (!pedido) return false;

    const totalPagado = await PagoModel.obtenerTotalPagado(id_pedido);
    return totalPagado >= pedido.total;
  },

  // Verificar si el pedido tiene un abono del 50% previo (excluyendo un pago específico)
   
  tieneAbono50Previo: async (id_pedido, id_pagoExcluir) => {
    const [abonos] = await sequelize.query(
      `SELECT * FROM PAGOS 
       WHERE id_pedido = ? 
       AND estado = 'Confirmado' 
       AND eleccion_pago = '50%'
       AND id_pago != ?`,
      { replacements: [id_pedido, id_pagoExcluir] }
    );
    return abonos && abonos.length > 0;
  }
};

export default PagoModel;