import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';

// MODELO DISTRIBUCIONES
const Distribucion = sequelize.define('Distribucion', {
  id_distribucion: {
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
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'USUARIOS',
      key: 'id_usuario'
    }
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'EN_ENTREGA', 'ENTREGADO', 'CANCELADO'),
    allowNull: false,
    defaultValue: 'PENDIENTE'
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'DISTRIBUCIONES',
  timestamps: false,
  hooks: {
    beforeCreate: (distribucion) => {
      distribucion.estado = distribucion.estado.toUpperCase();
    },
    beforeUpdate: (distribucion) => {
      if (distribucion.changed('estado')) {
        distribucion.estado = distribucion.estado.toUpperCase();
      }
      if (distribucion.estado === 'ENTREGADO' && !distribucion.fecha_entrega) {
        distribucion.fecha_entrega = new Date();
      }
    }
  }
});

// MÉTODOS DEL MODELO
const DistribucionModelo = {

  // Crear una nueva distribución (admin asigna pedido a repartidor)
  crear: async (data) => {
    const distribucion = await Distribucion.create({
      id_pedido: data.id_pedido,
      id_usuario: data.id_usuario,
      estado: 'PENDIENTE',
      observaciones: data.observaciones || null
    });
    return distribucion;
  },

  // Obtener distribución por ID (con datos del pedido)
  obtenerPorId: async (id_distribucion) => {
    const distribucion = await Distribucion.findByPk(id_distribucion, {
      include: [
        {
          model: sequelize.models.Pedido,
          as: 'pedido',
          attributes: ['id_pedido', 'direccion_entrega', 'total', 'fecha_estimada']
        },
        {
          model: sequelize.models.Usuario,
          as: 'repartidor',
          attributes: ['id_usuario', 'nombre_completo', 'email', 'telefono']
        }
      ]
    });
    return distribucion;
  },

  // Obtener todas las distribuciones (admin)
  obtenerTodas: async () => {
    const distribuciones = await Distribucion.findAll({
      include: [
        {
          model: sequelize.models.Pedido,
          as: 'pedido',
          attributes: ['id_pedido', 'direccion_entrega', 'total', 'fecha_estimada']
        },
        {
          model: sequelize.models.Usuario,
          as: 'repartidor',
          attributes: ['id_usuario', 'nombre_completo']
        }
      ],
      order: [['fecha_asignacion', 'DESC']]
    });
    return distribuciones;
  },


  //Obtener distribuciones de un usuario específico (admin o repartidor)
  obtenerPorUsuario: async (id_usuario) => {
    const distribuciones = await Distribucion.findAll({
      where: { id_usuario },
      include: [
        {
          model: sequelize.models.Pedido,
          as: 'pedido',
          attributes: ['id_pedido', 'direccion_entrega', 'total', 'fecha_estimada', 'id_usuario']
        }
      ],
      order: [['fecha_asignacion', 'DESC']]
    });
    return distribuciones;
  },


  // Obtener distribuciones pendientes de un repartidor (con dirección del pedido)
  obtenerPendientes: async (id_usuario) => {
    try {
      console.log(`Buscando pedidos pendientes para repartidor ${id_usuario}`);
    
      const distribuciones = await Distribucion.findAll({
        where: {
          id_usuario,
          estado: 'PENDIENTE'
        },
        include: [
          {
            model: sequelize.models.Pedido,
            as: 'pedido',
            attributes: ['id_pedido', 'direccion_entrega', 'total', 'fecha_estimada']
          }
        ],
        order: [['fecha_asignacion', 'ASC']]
      });
    
      console.log(`${distribuciones.length} pedidos pendientes encontrados`);
      return distribuciones;
    
    } catch (error) {
      console.error('Error en obtenerPendientes:', error);
      throw error;
    }
  },


  // Obtener distribuciones en entrega de un repartidor (con dirección del pedido)
  obtenerEnEntrega: async (id_usuario) => {
    try {
      console.log(`Buscando pedidos en entrega para repartidor ${id_usuario}`);
    
      const distribuciones = await Distribucion.findAll({
        where: {
          id_usuario,
          estado: 'EN_ENTREGA'
        },
        include: [
          {
            model: sequelize.models.Pedido,
            as: 'pedido',
            attributes: ['id_pedido', 'direccion_entrega', 'total', 'fecha_estimada']
          }
        ],
        order: [['fecha_asignacion', 'DESC']]
      });
    
      console.log(`${distribuciones.length} pedidos en entrega encontrados`);
      return distribuciones;
    
    } catch (error) {
      console.error('Error en obtenerEnEntrega:', error);
      throw error;
    }
  },


  // Obtener historial de entregas de un repartidor (con dirección del pedido)
  obtenerHistorial: async (id_usuario) => {
    const distribuciones = await Distribucion.findAll({
      where: {
        id_usuario,
        estado: 'ENTREGADO'
      },
      include: [
        {
          model: sequelize.models.Pedido,
          as: 'pedido',
          attributes: ['id_pedido', 'direccion_entrega', 'total', 'fecha_estimada']
        }
      ],
      order: [['fecha_entrega', 'DESC']]
    });
    return distribuciones;
  },


  // Iniciar entrega (repartidor)
  iniciarEntrega: async (id_distribucion) => {
    const distribucion = await Distribucion.findByPk(id_distribucion);
    if (!distribucion) return null;
    
    if (distribucion.estado !== 'PENDIENTE') {
      throw new Error(`No se puede iniciar una entrega en estado ${distribucion.estado}`);
    }
    
    await distribucion.update({ estado: 'EN_ENTREGA' });
    return distribucion;
  },

  // Marcar como entregado (repartidor) y actualizar estado del pedido

  marcarEntregado: async (id_distribucion) => {
    const distribucion = await Distribucion.findByPk(id_distribucion);
    if (!distribucion) return null;
    
    if (distribucion.estado !== 'EN_ENTREGA') {
      throw new Error(`No se puede marcar como entregado en estado ${distribucion.estado}`);
    }
    
    await distribucion.update({
      estado: 'ENTREGADO',
      fecha_entrega: new Date()
    });
    
    // Actualizar estado del pedido a 'Entregado'
    await sequelize.query(
      'UPDATE PEDIDOS SET estado = "Entregado" WHERE id_pedido = ?',
      { replacements: [distribucion.id_pedido] }
    );
    
    return distribucion;
  },

  // Cancelar entrega (admin)
  cancelarEntrega: async (id_distribucion, observacion) => {
    const distribucion = await Distribucion.findByPk(id_distribucion);
    if (!distribucion) return null;
    
    await distribucion.update({
      estado: 'CANCELADO',
      observaciones: observacion || 'Cancelado por administrador'
    });
    
    // Actualizar estado del pedido a 'Pendiente'
    await sequelize.query(
      'UPDATE PEDIDOS SET estado = "Pendiente" WHERE id_pedido = ?',
      { replacements: [distribucion.id_pedido] }
    );
    
    return distribucion;
  },


  // Verificar si un pedido ya tiene distribución activa
  pedidoTieneDistribucionActiva: async (id_pedido) => {
    const distribucion = await Distribucion.findOne({
      where: {
        id_pedido,
        estado: {
          [Op.in]: ['PENDIENTE', 'EN_ENTREGA']
        }
      }
    });
    return !!distribucion;
  }
};

export { Distribucion }; 
export default DistribucionModelo; 

//Nota de prueba