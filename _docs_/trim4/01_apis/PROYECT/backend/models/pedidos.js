// models/Pedido.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Pedido = sequelize.define('Pedido', {
  id_pedido: {
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
  id_formula: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'FORMULAS',
      key: 'id_formula'
    }
  },
  fecha_pedido: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_entrega: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  direccion_entrega: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(45),
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: {
        args: [['Pendiente', 'En Proceso', 'Enviado', 'Entregado', 'Cancelado', 'Abonado', 'Pagado']],
        msg: 'Estado inválido'
      }
    }
  },
  costo_envio: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'PEDIDOS',
  timestamps: false,
  hooks: {
    beforeCreate: (pedido) => {
      // Calcular fecha de entrega: 8-10 días después
      const fechaPedido = new Date();
      const dias = 8 + Math.floor(Math.random() * 3); // 8, 9 o 10 días
      const fechaEntrega = new Date(fechaPedido);
      fechaEntrega.setDate(fechaPedido.getDate() + dias);
      pedido.fecha_entrega = fechaEntrega.toISOString().split('T')[0];
    }
  }
});

// ========== MÉTODOS DEL MODELO ==========
const PedidoModelo = {

  // ============================================
  // CLIENTE
  // ============================================

  // Crear pedido (cliente)
  crear: async (data) => {
    const pedido = await Pedido.create({
      id_usuario: data.id_usuario,
      id_formula: data.id_formula || null,
      direccion_entrega: data.direccion_entrega,
      estado: 'Pendiente',
      costo_envio: data.costo_envio || 0,
      total: data.total
    });
    return pedido.id_pedido;
  },

  // Obtener pedidos de un cliente
  obtenerPorCliente: async (id_usuario) => {
    const pedidos = await sequelize.query(
      `SELECT p.*, 
        (SELECT COUNT(*) FROM PEDIDOS_PRODUCTOS pp WHERE pp.id_pedido = p.id_pedido) as total_productos
       FROM PEDIDOS p
       WHERE p.id_usuario = ?
       ORDER BY p.fecha_pedido DESC`,
      { replacements: [id_usuario], type: sequelize.QueryTypes.SELECT }
    );
    return pedidos;
  },

  // Obtener pedido por ID
  obtenerPorId: async (id_pedido) => {
    const [pedido] = await sequelize.query(
      `SELECT p.*, u.nombre_completo, u.email, u.telefono, u.direccion, u.ciudad
       FROM PEDIDOS p
       JOIN USUARIOS u ON p.id_usuario = u.id_usuario
       WHERE p.id_pedido = ?`,
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );
    return pedido;
  },

  // ============================================
  // ADMIN
  // ============================================

  // Obtener todos los pedidos
  obtenerTodos: async () => {
    const pedidos = await sequelize.query(
      `SELECT p.*, u.nombre_completo as cliente, u.email, u.telefono, u.ciudad
       FROM PEDIDOS p
       JOIN USUARIOS u ON p.id_usuario = u.id_usuario
       ORDER BY p.fecha_pedido DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return pedidos;
  },

  // Obtener pedidos por estado
  obtenerPorEstado: async (estado) => {
    const pedidos = await Pedido.findAll({
      where: { estado },
      order: [['fecha_pedido', 'DESC']]
    });
    return pedidos;
  },

  // Actualizar estado del pedido
  actualizarEstado: async (id_pedido, estado) => {
    const pedido = await Pedido.findByPk(id_pedido);
    if (!pedido) return false;
    await pedido.update({ estado });
    return true;
  },

  // Actualizar fecha de entrega (admin puede modificarla)
  actualizarFechaEntrega: async (id_pedido, fecha_entrega) => {
    const pedido = await Pedido.findByPk(id_pedido);
    if (!pedido) return false;
    await pedido.update({ fecha_entrega });
    return true;
  },

  // ============================================
  // UTILIDADES
  // ============================================

  // Verificar si el pedido pertenece al usuario
  perteneceAUsuario: async (id_pedido, id_usuario) => {
    const pedido = await Pedido.findOne({
      where: {
        id_pedido,
        id_usuario
      }
    });
    return !!pedido;
  },

  // Recalcular fecha de entrega (útil si cambia algo)
  recalcularFechaEntrega: async (id_pedido) => {
    const pedido = await Pedido.findByPk(id_pedido);
    if (!pedido) return false;
    
    const fechaPedido = new Date(pedido.fecha_pedido);
    const dias = 8 + Math.floor(Math.random() * 3);
    const fechaEntrega = new Date(fechaPedido);
    fechaEntrega.setDate(fechaPedido.getDate() + dias);
    
    await pedido.update({
      fecha_entrega: fechaEntrega.toISOString().split('T')[0]
    });
    return true;
  },

  // Obtener estadísticas de pedidos para admin
  obtenerEstadisticas: async () => {
    const [stats] = await sequelize.query(
      `SELECT 
        COUNT(*) as total_pedidos,
        SUM(CASE WHEN estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'En Proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'Enviado' THEN 1 ELSE 0 END) as enviados,
        SUM(CASE WHEN estado = 'Entregado' THEN 1 ELSE 0 END) as entregados,
        SUM(CASE WHEN estado = 'Cancelado' THEN 1 ELSE 0 END) as cancelados,
        SUM(CASE WHEN estado = 'Abonado' THEN 1 ELSE 0 END) as abonados,
        SUM(CASE WHEN estado = 'Pagado' THEN 1 ELSE 0 END) as pagados,
        SUM(total) as ingresos_totales,
        AVG(total) as promedio_venta,
        SUM(CASE WHEN ciudad = 'Bogotá' OR ciudad = 'Bogota' THEN 0 ELSE costo_envio END) as total_envios_cobrados
       FROM PEDIDOS p
       JOIN USUARIOS u ON p.id_usuario = u.id_usuario`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return stats;
  }
};

export default Pedido;