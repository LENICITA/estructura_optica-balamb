// controllers/distribucionController.js
import DistribucionModelo from '../models/Distribucion.js';
import sequelize from '../config/database.js';

// ============================================
// ADMIN - ASIGNAR PEDIDO A REPARTIDOR
// ============================================
export const asignarPedido = async (req, res) => {
  try {
    const { id_pedido, id_usuario, observaciones } = req.body;

    if (!id_pedido || !id_usuario) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: id_pedido, id_usuario'
      });
    }

    // Verificar que el pedido existe
    const [pedido] = await sequelize.query(
      'SELECT * FROM PEDIDOS WHERE id_pedido = ?',
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar que el pedido esté en estado Pagado
    if (pedido.estado !== 'Pagado') {
      return res.status(400).json({
        success: false,
        message: `El pedido debe estar en estado "Pagado". Estado actual: ${pedido.estado}`
      });
    }

    // Verificar que el repartidor existe y tiene rol REPARTIDOR
    const [repartidor] = await sequelize.query(
      `SELECT u.id_usuario, u.nombre_completo, u.email, u.telefono
       FROM USUARIOS u
       JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
       JOIN ROLES r ON ru.id_rol = r.id_rol
       WHERE u.id_usuario = ? AND r.nombre = 'REPARTIDOR' AND u.estado = 'ACTIVO'`,
      { replacements: [id_usuario], type: sequelize.QueryTypes.SELECT }
    );

    if (!repartidor) {
      return res.status(404).json({
        success: false,
        message: 'Repartidor no encontrado o no tiene rol REPARTIDOR'
      });
    }

    // Verificar que el pedido no tenga una distribución activa
    const [distribucionExistente] = await sequelize.query(
      `SELECT * FROM DISTRIBUCIONES 
       WHERE id_pedido = ? AND estado IN ('PENDIENTE', 'EN_ENTREGA')`,
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );

    if (distribucionExistente) {
      return res.status(400).json({
        success: false,
        message: 'Este pedido ya tiene una distribución activa'
      });
    }

    // Crear la distribución
    const distribucion = await DistribucionModelo.crear({
      id_pedido,
      id_usuario,
      observaciones: observaciones || null
    });

    // Actualizar estado del pedido a 'En Proceso'
    await sequelize.query(
      'UPDATE PEDIDOS SET estado = "En Proceso" WHERE id_pedido = ?',
      { replacements: [id_pedido] }
    );

    // Obtener la distribución con detalles del pedido
    const distribucionCreada = await DistribucionModelo.obtenerPorId(distribucion.id_distribucion);

    res.status(201).json({
      success: true,
      message: 'Pedido asignado exitosamente al repartidor',
      data: {
        distribucion: distribucionCreada,
        repartidor: {
          id: repartidor.id_usuario,
          nombre: repartidor.nombre_completo,
          email: repartidor.email,
          telefono: repartidor.telefono
        },
        pedido: {
          id_pedido: pedido.id_pedido,
          direccion_entrega: pedido.direccion_entrega,
          total: pedido.total,
          fecha_estimada: pedido.fecha_estimada
        }
      }
    });

  } catch (error) {
    console.error('Error al asignar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar el pedido',
      error: error.message
    });
  }
};

// ============================================
// REPARTIDOR - VER MIS PEDIDOS PENDIENTES (CON DIRECCIÓN)
// ============================================
export const obtenerPendientes = async (req, res) => {
  try {
    const usuario = req.usuario;

    const distribuciones = await DistribucionModelo.obtenerPendientes(usuario.id_usuario);

    res.json({
      success: true,
      count: distribuciones.length,
      data: distribuciones.map(d => ({
        id_distribucion: d.id_distribucion,
        estado: d.estado,
        fecha_asignacion: d.fecha_asignacion,
        pedido: d.pedido ? {
          id_pedido: d.pedido.id_pedido,
          direccion_entrega: d.pedido.direccion_entrega,  // ← Dirección
          total: d.pedido.total,
          fecha_estimada: d.pedido.fecha_estimada
        } : null
      }))
    });

  } catch (error) {
    console.error('Error al obtener pedidos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos pendientes',
      error: error.message
    });
  }
};

// ============================================
// REPARTIDOR - VER MIS PEDIDOS EN ENTREGA (CON DIRECCIÓN)
// ============================================
export const obtenerEnEntrega = async (req, res) => {
  try {
    const usuario = req.usuario;

    const distribuciones = await DistribucionModelo.obtenerEnEntrega(usuario.id_usuario);

    res.json({
      success: true,
      count: distribuciones.length,
      data: distribuciones.map(d => ({
        id_distribucion: d.id_distribucion,
        estado: d.estado,
        fecha_asignacion: d.fecha_asignacion,
        pedido: d.pedido ? {
          id_pedido: d.pedido.id_pedido,
          direccion_entrega: d.pedido.direccion_entrega,  // ← Dirección
          total: d.pedido.total,
          fecha_estimada: d.pedido.fecha_estimada
        } : null
      }))
    });

  } catch (error) {
    console.error('Error al obtener pedidos en entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos en entrega',
      error: error.message
    });
  }
};

// ============================================
// REPARTIDOR - VER DETALLE DE UNA DISTRIBUCIÓN (CON DIRECCIÓN)
// ============================================
export const obtenerDistribucionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const distribucion = await DistribucionModelo.obtenerPorId(id);

    if (!distribucion) {
      return res.status(404).json({
        success: false,
        message: 'Distribución no encontrada'
      });
    }

    // Verificar que el repartidor sea el dueño o sea admin
    const esAdmin = usuario.rol === 'ADMIN';
    if (!esAdmin && distribucion.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta distribución'
      });
    }

    res.json({
      success: true,
      data: {
        id_distribucion: distribucion.id_distribucion,
        estado: distribucion.estado,
        fecha_asignacion: distribucion.fecha_asignacion,
        fecha_entrega: distribucion.fecha_entrega,
        observaciones: distribucion.observaciones,
        pedido: distribucion.pedido ? {
          id_pedido: distribucion.pedido.id_pedido,
          direccion_entrega: distribucion.pedido.direccion_entrega,  // ← Dirección
          total: distribucion.pedido.total,
          fecha_estimada: distribucion.pedido.fecha_estimada
        } : null,
        repartidor: distribucion.repartidor ? {
          id: distribucion.repartidor.id_usuario,
          nombre: distribucion.repartidor.nombre_completo,
          email: distribucion.repartidor.email,
          telefono: distribucion.repartidor.telefono
        } : null
      }
    });

  } catch (error) {
    console.error('Error al obtener distribución:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener distribución',
      error: error.message
    });
  }
};

// ============================================
// REPARTIDOR - INICIAR ENTREGA
// ============================================
export const iniciarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const distribucion = await DistribucionModelo.obtenerPorId(id);

    if (!distribucion) {
      return res.status(404).json({
        success: false,
        message: 'Distribución no encontrada'
      });
    }

    if (distribucion.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para iniciar esta entrega'
      });
    }

    if (distribucion.estado !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: `No puedes iniciar una entrega en estado ${distribucion.estado}`
      });
    }

    const distribucionActualizada = await DistribucionModelo.iniciarEntrega(id);

    res.json({
      success: true,
      message: 'Entrega iniciada exitosamente',
      data: distribucionActualizada
    });

  } catch (error) {
    console.error('Error al iniciar entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar la entrega',
      error: error.message
    });
  }
};

// ============================================
// REPARTIDOR - MARCAR COMO ENTREGADO
// ============================================
export const marcarEntregado = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const distribucion = await DistribucionModelo.obtenerPorId(id);

    if (!distribucion) {
      return res.status(404).json({
        success: false,
        message: 'Distribución no encontrada'
      });
    }

    if (distribucion.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para marcar esta entrega'
      });
    }

    if (distribucion.estado !== 'EN_ENTREGA') {
      return res.status(400).json({
        success: false,
        message: `No puedes marcar como entregado en estado ${distribucion.estado}`
      });
    }

    const distribucionActualizada = await DistribucionModelo.marcarEntregado(id);

    res.json({
      success: true,
      message: 'Pedido marcado como entregado exitosamente',
      data: distribucionActualizada
    });

  } catch (error) {
    console.error('Error al marcar entregado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar como entregado',
      error: error.message
    });
  }
};

// ============================================
// REPARTIDOR - VER HISTORIAL DE ENTREGAS (CON DIRECCIÓN)
// ============================================
export const obtenerHistorial = async (req, res) => {
  try {
    const usuario = req.usuario;

    const historial = await DistribucionModelo.obtenerHistorial(usuario.id_usuario);

    res.json({
      success: true,
      count: historial.length,
      data: historial.map(d => ({
        id_distribucion: d.id_distribucion,
        estado: d.estado,
        fecha_asignacion: d.fecha_asignacion,
        fecha_entrega: d.fecha_entrega,
        pedido: d.pedido ? {
          id_pedido: d.pedido.id_pedido,
          direccion_entrega: d.pedido.direccion_entrega,  // ← Dirección
          total: d.pedido.total,
          fecha_estimada: d.pedido.fecha_estimada
        } : null
      }))
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - OBTENER TODAS LAS DISTRIBUCIONES
// ============================================
export const obtenerTodas = async (req, res) => {
  try {
    const distribuciones = await DistribucionModelo.obtenerTodas();

    res.json({
      success: true,
      count: distribuciones.length,
      data: distribuciones.map(d => ({
      id_distribucion: d.id_distribucion,
        estado: d.estado,
        fecha_asignacion: d.fecha_asignacion,
        pedido: {
          id_pedido: d.pedido?.id_pedido,
          direccion_entrega: d.pedido?.direccion_entrega,
          total: d.pedido?.total
        },
        repartidor: {  // ← Aquí está el nombre
          id: d.repartidor?.id_usuario,
          nombre: d.repartidor?.nombre_completo
        }
      }))
    });

  } catch (error) {
    console.error('Error al obtener distribuciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener distribuciones',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - CANCELAR ENTREGA
// ============================================
export const cancelarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacion } = req.body;

    const distribucion = await DistribucionModelo.obtenerPorId(id);

    if (!distribucion) {
      return res.status(404).json({
        success: false,
        message: 'Distribución no encontrada'
      });
    }

    if (distribucion.estado === 'ENTREGADO') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una entrega ya entregada'
      });
    }

    const distribucionActualizada = await DistribucionModelo.cancelarEntrega(id, observacion);

    res.json({
      success: true,
      message: 'Entrega cancelada exitosamente',
      data: distribucionActualizada
    });

  } catch (error) {
    console.error('Error al cancelar entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar la entrega',
      error: error.message
    });
  }
};