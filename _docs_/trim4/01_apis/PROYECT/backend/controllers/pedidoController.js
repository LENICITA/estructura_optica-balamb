// controllers/pedidoController.js
import Pedido from '../models/pedidos.js';
import PedidoProducto from '../models/pedidoprodutos.js';
import sequelize from '../config/database.js';

// ============================================
// UTILIDAD - CALCULAR COSTO DE ENVÍO SEGÚN CIUDAD
// ============================================
const calcularCostoEnvio = (ciudad) => {
  if (!ciudad) return 10000;
  const ciudadLower = ciudad.toLowerCase().trim();
  if (ciudadLower === 'bogotá' || ciudadLower === 'bogota') {
    return 0;
  }
  return 10000;
};

// ============================================
// CLIENTE - CREAR PEDIDO
// ============================================
export const crearPedido = async (req, res) => {
  try {
    const { id_formula, direccion_entrega, productos } = req.body;
    const usuario = req.usuario;

    // Validar campos requeridos
    if (!direccion_entrega) {
      return res.status(400).json({
        success: false,
        message: 'La dirección de entrega es obligatoria'
      });
    }

    if (!productos || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debes agregar al menos un producto'
      });
    }

    // Obtener ciudad del usuario
    const [usuarioData] = await sequelize.query(
      'SELECT ciudad FROM USUARIOS WHERE id_usuario = ?',
      { replacements: [usuario.id_usuario], type: sequelize.QueryTypes.SELECT }
    );

    const ciudad = usuarioData?.ciudad || '';
    const costo_envio = calcularCostoEnvio(ciudad);

    // Calcular subtotal
    let subtotal = 0;
    for (const item of productos) {
      const [producto] = await sequelize.query(
        'SELECT precio FROM PRODUCTOS WHERE id_producto = ?',
        { replacements: [item.id_producto], type: sequelize.QueryTypes.SELECT }
      );
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: `Producto con ID ${item.id_producto} no encontrado`
        });
      }
      subtotal += producto.precio * item.cantidad;
    }

    const total = subtotal + costo_envio;

    // Crear el pedido
    const id_pedido = await PedidoModelo.crear({
      id_usuario: usuario.id_usuario,
      id_formula: id_formula || null,
      direccion_entrega,
      total,
      costo_envio
    });

    // Agregar productos al pedido
    await PedidoProductoModelo.agregarMultiples(id_pedido, productos);

    const pedido = await PedidoModelo.obtenerPorId(id_pedido);

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: {
        id_pedido: pedido.id_pedido,
        fecha_pedido: pedido.fecha_pedido,
        fecha_entrega: pedido.fecha_entrega,
        subtotal: subtotal,
        costo_envio: costo_envio,
        total: total,
        estado: pedido.estado,
        direccion_entrega: pedido.direccion_entrega
      }
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el pedido',
      error: error.message
    });
  }
};

// ============================================
// CLIENTE - VER MIS PEDIDOS
// ============================================
export const obtenerMisPedidos = async (req, res) => {
  try {
    const usuario = req.usuario;
    const pedidos = await PedidoModelo.obtenerPorCliente(usuario.id_usuario);

    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });

  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus pedidos',
      error: error.message
    });
  }
};

// ============================================
// CLIENTE - VER DETALLE DE PEDIDO
// ============================================
export const obtenerPedidoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const pedido = await PedidoModelo.obtenerPorId(id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar permisos: solo dueño o admin
    const esAdmin = usuario.rol === 'ADMIN';
    if (!esAdmin && pedido.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este pedido'
      });
    }

    const productos = await PedidoProductoModelo.obtenerPorPedido(id);

    res.json({
      success: true,
      data: {
        pedido: {
          id_pedido: pedido.id_pedido,
          fecha_pedido: pedido.fecha_pedido,
          fecha_entrega: pedido.fecha_entrega,
          estado: pedido.estado,
          direccion_entrega: pedido.direccion_entrega,
          costo_envio: pedido.costo_envio,
          total: pedido.total,
          cliente: {
            id: pedido.id_usuario,
            nombre: pedido.nombre_completo,
            email: pedido.email,
            telefono: pedido.telefono
          }
        },
        productos
      }
    });

  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el pedido',
      error: error.message
    });
  }
};

// ============================================
// CLIENTE - CANCELAR PEDIDO
// ============================================
export const cancelarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    const pedido = await PedidoModelo.obtenerPorId(id);
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar que el pedido pertenece al usuario
    if (pedido.id_usuario !== usuario.id_usuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar este pedido'
      });
    }

    // Verificar que el pedido esté en estado cancelable
    const estadosNoCancelables = ['Entregado', 'En Proceso', 'Enviado'];
    if (estadosNoCancelables.includes(pedido.estado)) {
      return res.status(400).json({
        success: false,
        message: `No puedes cancelar un pedido en estado ${pedido.estado}`
      });
    }

    await PedidoModelo.actualizarEstado(id, 'Cancelado');

    const pedidoActualizado = await PedidoModelo.obtenerPorId(id);

    res.json({
      success: true,
      message: 'Pedido cancelado exitosamente',
      data: pedidoActualizado
    });

  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar el pedido',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - OBTENER TODOS LOS PEDIDOS
// ============================================
export const obtenerTodosLosPedidos = async (req, res) => {
  try {
    const pedidos = await PedidoModelo.obtenerTodos();

    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });

  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los pedidos',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - OBTENER PEDIDOS POR ESTADO
// ============================================
export const obtenerPedidosPorEstado = async (req, res) => {
  try {
    const { estado } = req.params;

    const estadosValidos = ['Pendiente', 'En Proceso', 'Enviado', 'Entregado', 'Cancelado', 'Abonado', 'Pagado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    const pedidos = await PedidoModelo.obtenerPorEstado(estado);

    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });

  } catch (error) {
    console.error('Error al obtener pedidos por estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los pedidos',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - ACTUALIZAR ESTADO DEL PEDIDO
// ============================================
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Pendiente', 'En Proceso', 'Enviado', 'Entregado', 'Cancelado', 'Abonado', 'Pagado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: Pendiente, En Proceso, Enviado, Entregado, Cancelado, Abonado, Pagado'
      });
    }

    const pedido = await PedidoModelo.obtenerPorId(id);
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    await PedidoModelo.actualizarEstado(id, estado);

    const pedidoActualizado = await PedidoModelo.obtenerPorId(id);

    res.json({
      success: true,
      message: `Estado actualizado a: ${estado}`,
      data: pedidoActualizado
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - ACTUALIZAR FECHA DE ENTREGA
// ============================================
export const actualizarFechaEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_entrega } = req.body;

    if (!fecha_entrega) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de entrega es requerida'
      });
    }

    const pedido = await PedidoModelo.obtenerPorId(id);
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    await PedidoModelo.actualizarFechaEntrega(id, fecha_entrega);

    const pedidoActualizado = await PedidoModelo.obtenerPorId(id);

    res.json({
      success: true,
      message: 'Fecha de entrega actualizada',
      data: pedidoActualizado
    });

  } catch (error) {
    console.error('Error al actualizar fecha:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la fecha de entrega',
      error: error.message
    });
  }
};

// ============================================
// ADMIN - ESTADÍSTICAS DE PEDIDOS
// ============================================
export const obtenerEstadisticasPedidos = async (req, res) => {
  try {
    const estadisticas = await PedidoModelo.obtenerEstadisticas();

    res.json({
      success: true,
      data: estadisticas
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};