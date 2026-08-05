import DistribucionModelo from '../models/Distribucion.js';
import sequelize from '../config/database.js';

// ADMIN - ASIGNAR PEDIDO A REPARTIDOR
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

    // OBTENER CIUDAD DEL USUARIO DEL PEDIDO
    const [usuarioPedido] = await sequelize.query(
      'SELECT ciudad FROM USUARIOS WHERE id_usuario = ?',
      { replacements: [pedido.id_usuario], type: sequelize.QueryTypes.SELECT }
    );

    const ciudad = pedido.ciudad_envio?.toLowerCase().trim() || '';
    const esBogota = ciudad === 'bogotá' || ciudad === 'bogota';

    // DETERMINAR A QUIEN ASIGNAR SEGÚN CIUDAD
    let usuarioAsignado = id_usuario;
    let tipoAsignacion = '';
    let usuarioInfo = null;

    if (esBogota) {
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
      usuarioAsignado = id_usuario;
      tipoAsignacion = 'REPARTIDOR';
      usuarioInfo = repartidor;
    } else {
      // FUERA DE BOGOTÁ → ADMIN (distribuidora externa)
      const [admin] = await sequelize.query(
        `SELECT u.id_usuario 
         FROM USUARIOS u
         JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
         JOIN ROLES r ON ru.id_rol = r.id_rol
         WHERE r.nombre = 'ADMIN' AND u.estado = 'ACTIVO'
         LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró un administrador para asignar la distribución externa'
        });
      }

      // Verificar que el admin existe
      const [adminExistente] = await sequelize.query(
        'SELECT id_usuario FROM USUARIOS WHERE id_usuario = ? AND estado = "ACTIVO"',
        { replacements: [admin.id_usuario], type: sequelize.QueryTypes.SELECT }
      );

      if (!adminExistente) {
        return res.status(404).json({
          success: false,
          message: 'El administrador asignado no existe o está inactivo'
        });
      }

      usuarioAsignado = admin.id_usuario;
      tipoAsignacion = 'DISTRIBUIDORA_EXTERNA';
      usuarioInfo = admin;
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

    // CREAR OBSERVACIONES PERSONALIZADAS
    let observacionesFinal = observaciones || null;
    
    if (!esBogota) {
      observacionesFinal = `ENVÍO FUERA DE BOGOTÁ - DISTRIBUIDORA EXTERNA
Ciudad del cliente: ${ciudad}
${observaciones ? 'Observaciones adicionales: ' + observaciones : ''}`;
    } else {
      observacionesFinal = `ENTREGA EN BOGOTÁ - REPARTIDOR
${observaciones ? 'Observaciones: ' + observaciones : ''}`;
    }

    // Crear la distribución
    const distribucion = await DistribucionModelo.crear({
      id_pedido,
      id_usuario,
      observaciones: observacionesFinal || null
    });

    // Actualizar estado del pedido a 'En Proceso'
    await sequelize.query(
      'UPDATE PEDIDOS SET estado = "En Proceso" WHERE id_pedido = ?',
      { replacements: [id_pedido] }
    );

    // Obtener la distribución con detalles del pedido
    const distribucionCreada = await DistribucionModelo.obtenerPorId(distribucion.id_distribucion);

    let mensaje = '';
    if (esBogota) {
      mensaje = `Pedido asignado exitosamente al repartidor ${usuarioInfo.nombre_completo}`;
    } else {
      mensaje = `Pedido asignado a distribuidora externa (Ciudad: ${ciudad})`;
    }

    res.status(201).json({
      success: true,
      message: mensaje,
      data: {
        distribucion: distribucionCreada,
        tipo_asignacion: tipoAsignacion,
        ciudad_cliente: ciudad,
        es_bogota: esBogota,
        usuario_asignado: {
          id: usuarioAsignado,
          nombre_completo: usuarioInfo.nombre_completo,
          email: usuarioInfo.email,
          telefono: usuarioInfo.telefono
        },
        pedido: {
          id_pedido: pedido.id_pedido,
          direccion_entrega: pedido.direccion_entrega,
          ciudad_envio: pedido.ciudad_envio,
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

// REPARTIDOR - VER MIS PEDIDOS PENDIENTES (CON DIRECCIÓN)
export const obtenerPendientes = async (req, res) => {
  try {
    const usuario = req.user;

    console.log('Usuario autenticado:', usuario);
    console.log('usuario.id:', usuario?.id);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const esAdmin = usuario.roles?.includes('ADMIN') || false;
    let distribuciones = [];

    if (esAdmin) {
      // ADMIN: ve solo distribuciones externas
      const [admin] = await sequelize.query(
        `SELECT u.id_usuario 
         FROM USUARIOS u
         JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
         JOIN ROLES r ON ru.id_rol = r.id_rol
         WHERE r.nombre = 'ADMIN' AND u.estado = 'ACTIVO'
         LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró un administrador'
        });
      }

      // Obtener todas las distribuciones pendientes del admin
      const todas = await DistribucionModelo.obtenerPendientes(admin.id_usuario);
      
      // Filtrar solo las externas (ciudad_envio != Bogotá)
      for (const dist of todas) {
        if (dist.pedido && dist.pedido.ciudad_envio) {
          const ciudad = dist.pedido.ciudad_envio.toLowerCase().trim();
          if (ciudad !== 'bogotá' && ciudad !== 'bogota') {
            distribuciones.push(dist);
          }
        }
      }
    } else {
      // REPARTIDOR: ve solo sus pedidos
      distribuciones = await DistribucionModelo.obtenerPendientes(usuario.id);
    }

    // Obtener datos del cliente para cada distribución
    const distribucionesConCliente = [];
    for (const d of distribuciones) {
      let clienteData = null;
      if (d.pedido) {
        const [cliente] = await sequelize.query(
          `SELECT nombre_completo, telefono, ciudad 
           FROM USUARIOS 
           WHERE id_usuario = ?`,
          { replacements: [d.pedido.id_usuario], type: sequelize.QueryTypes.SELECT }
        );
        clienteData = cliente;
      }
      distribucionesConCliente.push({
        id_distribucion: d.id_distribucion,
        estado: d.estado,
        fecha_asignacion: d.fecha_asignacion,
        pedido: d.pedido ? {
          id_pedido: d.pedido.id_pedido,
          direccion_entrega: d.pedido.direccion_entrega || 'Sin dirección',
          ciudad_envio: d.pedido.ciudad_envio || 'Sin ciudad', 
          total: d.pedido.total || 0,
          fecha_estimada: d.pedido.fecha_estimada || null,
          cliente: clienteData ? {
            nombre: clienteData.nombre_completo,
            telefono: clienteData.telefono,
            ciudad: clienteData.ciudad
          } : null
        } : null
      });
    }

    console.log(`${distribucionesConCliente.length} pedidos pendientes encontrados`);

    res.json({
      success: true,
      count: distribucionesConCliente.length,
      data: distribucionesConCliente
    });

  } catch (error) {
    console.error('Error al obtener pedidos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos pendientes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// REPARTIDOR - VER MIS PEDIDOS EN ENTREGA (CON DIRECCIÓN)
export const obtenerEnEntrega = async (req, res) => {
  try {
    const usuario = req.user;

    console.log('Usuario autenticado:', usuario);
    console.log('usuario.id:', usuario?.id);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const esAdmin = usuario.roles?.includes('ADMIN') || false;
    let distribuciones = [];

    if (esAdmin) {
      //  ADMIN: ve solo distribuciones externas
      const [admin] = await sequelize.query(
        `SELECT u.id_usuario 
         FROM USUARIOS u
         JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
         JOIN ROLES r ON ru.id_rol = r.id_rol
         WHERE r.nombre = 'ADMIN' AND u.estado = 'ACTIVO'
         LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró un administrador'
        });
      }

      const todas = await DistribucionModelo.obtenerEnEntrega(admin.id_usuario);
      
      for (const dist of todas) {
        if (dist.pedido && dist.pedido.ciudad_envio) {
          const ciudad = dist.pedido.ciudad_envio.toLowerCase().trim();
          if (ciudad !== 'bogotá' && ciudad !== 'bogota') {
            distribuciones.push(dist);
          }
        }
      }
    } else {
      distribuciones = await DistribucionModelo.obtenerEnEntrega(usuario.id);
    }

    const distribucionesConCliente = [];
    for (const d of distribuciones) {
      let clienteData = null;
      if (d.pedido) {
        const [cliente] = await sequelize.query(
          `SELECT nombre_completo, telefono, ciudad 
           FROM USUARIOS 
           WHERE id_usuario = ?`,
          { replacements: [d.pedido.id_usuario], type: sequelize.QueryTypes.SELECT }
        );
        clienteData = cliente;
      }
      distribucionesConCliente.push({
        id_distribucion: d.id_distribucion,
        estado: d.estado,
        fecha_asignacion: d.fecha_asignacion,
        pedido: d.pedido ? {
          id_pedido: d.pedido.id_pedido,
          direccion_entrega: d.pedido.direccion_entrega || 'Sin dirección',
          ciudad_envio: d.pedido.ciudad_envio || 'Sin ciudad',
          total: d.pedido.total || 0,
          fecha_estimada: d.pedido.fecha_estimada || null,
          cliente: clienteData ? {
            nombre: clienteData.nombre_completo,
            telefono: clienteData.telefono,
            ciudad: clienteData.ciudad
          } : null
        } : null
      });
    }

    console.log(`${distribucionesConCliente.length} pedidos en entrega encontrados`);

    res.json({
      success: true,
      count: distribucionesConCliente.length,
      data: distribucionesConCliente
    });

  } catch (error) {
    console.error('Error al obtener pedidos en entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos en entrega',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// REPARTIDOR - VER DETALLE DE UNA DISTRIBUCIÓN (CON DIRECCIÓN)
export const obtenerDistribucionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const distribucion = await DistribucionModelo.obtenerPorId(id);

    if (!distribucion) {
      return res.status(404).json({
        success: false,
        message: 'Distribución no encontrada'
      });
    }

    const esAdmin = usuario.roles?.includes('ADMIN') || false;
    if (!esAdmin && distribucion.id_usuario !== usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta distribución'
      });
    }

    //  Si es admin, puede ver cualquier distribución

    // Obtener datos del cliente del pedido
    let clienteData = null;
    if (distribucion.pedido) {
      const [cliente] = await sequelize.query(
        `SELECT nombre_completo, telefono, ciudad 
         FROM USUARIOS 
         WHERE id_usuario = ?`,
        { replacements: [distribucion.pedido.id_usuario], type: sequelize.QueryTypes.SELECT }
      );
      clienteData = cliente;
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
          direccion_entrega: distribucion.pedido.direccion_entrega,
          ciudad_envio: distribucion.pedido.ciudad_envio || 'Sin ciudad', 
          total: distribucion.pedido.total,
          fecha_estimada: distribucion.pedido.fecha_estimada,
          cliente: clienteData ? {
            nombre: clienteData.nombre_completo,
            telefono: clienteData.telefono,
            ciudad: clienteData.ciudad
          } : null
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// REPARTIDOR - INICIAR ENTREGA
export const iniciarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const distribucion = await DistribucionModelo.obtenerPorId(id);

    if (!distribucion) {
      return res.status(404).json({
        success: false,
        message: 'Distribución no encontrada'
      });
    }

    // Verificar permisos
    const esAdmin = usuario.roles?.includes('ADMIN') || false;
    const esRepartidor = usuario.roles?.includes('REPARTIDOR') || false;

    //  Si es repartidor, solo puede iniciar sus propias distribuciones
    if (esRepartidor && distribucion.id_usuario !== usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para iniciar esta entrega'
      });
    }

    //  Si es admin, solo puede iniciar distribuciones externas
    if (esAdmin) {
      const [pedido] = await sequelize.query(
        `SELECT ciudad_envio FROM PEDIDOS WHERE id_pedido = ?`,
        { replacements: [distribucion.id_pedido], type: sequelize.QueryTypes.SELECT }
      );

      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      const ciudad = pedido.ciudad_envio?.toLowerCase().trim() || '';
      const esBogota = ciudad === 'bogotá' || ciudad === 'bogota';

      if (esBogota) {
        return res.status(403).json({
          success: false,
          message: 'Solo el repartidor asignado puede iniciar entregas en Bogotá'
        });
      }
    }

    if (distribucion.estado !== 'PENDIENTE') {
      return res.status(400).json({
        success: false,
        message: `No puedes iniciar una entrega en estado ${distribucion.estado}`
      });
    }

    const distribucionActualizada = await DistribucionModelo.iniciarEntrega(id);

    //  Actualizar pedido a ENVIADO
    await sequelize.query(
      'UPDATE PEDIDOS SET estado = "Enviado" WHERE id_pedido = ?',
      { replacements: [distribucion.id_pedido] }
    );

    res.json({
      success: true,
      message: 'Entrega iniciada exitosamente. Pedido enviado.',
      data: distribucionActualizada
    });

  } catch (error) {
    console.error('Error al iniciar entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar la entrega',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// REPARTIDOR - MARCAR COMO ENTREGADO
export const marcarEntregado = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacion } = req.body;
    const usuario = req.user;

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const distribucion = await DistribucionModelo.obtenerPorId(id);

    if (!distribucion) {
      return res.status(404).json({
        success: false,
        message: 'Distribución no encontrada'
      });
    }

    // Verificar permisos
    const esAdmin = usuario.roles?.includes('ADMIN') || false;
    const esRepartidor = usuario.roles?.includes('REPARTIDOR') || false;

    // Si es repartidor, solo puede marcar sus propias distribuciones
    if (esRepartidor && distribucion.id_usuario !== usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para marcar esta entrega'
      });
    }

    // Si es admin, solo puede marcar distribuciones externas
    if (esAdmin) {
      const [pedido] = await sequelize.query(
        `SELECT ciudad_envio FROM PEDIDOS WHERE id_pedido = ?`,
        { replacements: [distribucion.id_pedido], type: sequelize.QueryTypes.SELECT }
      );

      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      const ciudad = pedido.ciudad_envio?.toLowerCase().trim() || '';
      const esBogota = ciudad === 'bogotá' || ciudad === 'bogota';

      if (esBogota) {
        return res.status(403).json({
          success: false,
          message: 'Solo el repartidor asignado puede marcar entregas en Bogotá'
        });
      }
    }

    if (distribucion.estado !== 'EN_ENTREGA') {
      return res.status(400).json({
        success: false,
        message: `No puedes marcar como entregado en estado ${distribucion.estado}`
      });
    }

    // Agregar observación si se proporcionó
    if (observacion) {
      const obsActual = distribucion.observaciones || '';
      await sequelize.query(
        `UPDATE DISTRIBUCIONES 
         SET observaciones = CONCAT(?, '\\n', ?) 
         WHERE id_distribucion = ?`,
        { 
          replacements: [obsActual, ` ENTREGADO: ${observacion}`, id],
          type: sequelize.QueryTypes.UPDATE
        }
      );
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// REPARTIDOR - VER HISTORIAL DE ENTREGAS (CON DIRECCIÓN)
export const obtenerHistorial = async (req, res) => {
  try {
    const usuario = req.user;

    console.log('Usuario autenticado:', usuario);

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const esAdmin = usuario.roles?.includes('ADMIN') || false;
    let historial = [];

    if (esAdmin) {
      //  ADMIN: ve historial de distribuciones externas
      const [admin] = await sequelize.query(
        `SELECT u.id_usuario 
         FROM USUARIOS u
         JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
         JOIN ROLES r ON ru.id_rol = r.id_rol
         WHERE r.nombre = 'ADMIN' AND u.estado = 'ACTIVO'
         LIMIT 1`,
        { type: sequelize.QueryTypes.SELECT }
      );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró un administrador'
        });
      }

      const todas = await DistribucionModelo.obtenerHistorial(admin.id_usuario);
      
      for (const d of todas) {
        if (d.pedido && d.pedido.ciudad_envio) {
          const ciudad = d.pedido.ciudad_envio.toLowerCase().trim();
          if (ciudad !== 'bogotá' && ciudad !== 'bogota') {
            historial.push(d);
          }
        }
      }
    } else {
      //  REPARTIDOR: ve su historial
      historial = await DistribucionModelo.obtenerHistorial(usuario.id);
    }

    console.log(`${historial.length} entregas completadas encontradas`);

    res.json({
      success: true,
      count: historial.length,
      data: historial.map(d => ({
        id_distribucion: d.id_distribucion,
        estado: d.estado,
        fecha_asignacion: d.fecha_asignacion,
        fecha_entrega: d.fecha_entrega,
        observaciones: d.observaciones,
        pedido: d.pedido ? {
          id_pedido: d.pedido.id_pedido,
          direccion_entrega: d.pedido.direccion_entrega || 'Sin dirección',
          ciudad_envio: d.pedido.ciudad_envio || 'Sin ciudad', 
          total: d.pedido.total || 0,
          fecha_estimada: d.pedido.fecha_estimada || null,
          cliente: d.cliente || 'Cliente'
        } : null
      }))
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ADMIN - OBTENER TODAS LAS DISTRIBUCIONES
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
          ciudad_envio: d.pedido?.ciudad_envio,
          fecha_estimada: d.pedido?.fecha_estimada,
          total: d.pedido?.total
        },
        repartidor: {
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

// ADMIN - CANCELAR ENTREGA
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

    await sequelize.query(
      'UPDATE PEDIDOS SET estado = "Pagado" WHERE id_pedido = ?',
      { replacements: [distribucion.id_pedido] }
    );

    res.json({
      success: true,
      message: 'Entrega cancelada exitosamente. El pedido vuelve a estado PAGADO.',
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

// ADMIN - OBTENER DISTRIBUCIONES EXTERNAS (FUERA DE BOGOTÁ)
export const obtenerDistribucionesExternas = async (req, res) => {
  try {
    // Buscar el ADMIN (distribuidora externa)
    const [admin] = await sequelize.query(
      `SELECT u.id_usuario, u.nombre_completo, u.email, u.telefono
       FROM USUARIOS u
       JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
       JOIN ROLES r ON ru.id_rol = r.id_rol
       WHERE r.nombre = 'ADMIN' AND u.estado = 'ACTIVO'
       LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT }
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró un administrador'
      });
    }

    // Obtener todas las distribuciones del admin
    const distribuciones = await DistribucionModelo.obtenerPorUsuario(admin.id_usuario);

    // Enriquecer con ciudad del cliente
    const distribucionesExternas = [];
    for (const dist of distribuciones) {
      if (dist.pedido) {
        // Obtener ciudad del usuario del pedido
        const [usuario] = await sequelize.query(
          'SELECT id_usuario, nombre_completo, ciudad, email, telefono FROM USUARIOS WHERE id_usuario = ?',
          { replacements: [dist.pedido.id_usuario], type: sequelize.QueryTypes.SELECT }
        );
        
        const ciudad = dist.pedido.ciudad_envio || 'Desconocida';
        const esBogota = ciudad.toLowerCase().trim() === 'bogotá' || ciudad.toLowerCase().trim() === 'bogota';
        
        if (!esBogota) {
          distribucionesExternas.push({
            id_distribucion: dist.id_distribucion,
            estado: dist.estado,
            fecha_asignacion: dist.fecha_asignacion,
            fecha_entrega: dist.fecha_entrega,
            observaciones: dist.observaciones,
            admin_asignado: {
              id: admin.id_usuario,
              nombre_completo: admin.nombre_completo,
              email: admin.email,
              telefono: admin.telefono
            },
            cliente: {
              id: usuario?.id_usuario || null,
              nombre_completo: usuario?.nombre_completo || 'Desconocido',
              email: usuario?.email || 'Desconocido',
              telefono: usuario?.telefono || 'Desconocido',
              ciudad: ciudad
            },
            pedido: {
              id_pedido: dist.pedido.id_pedido,
              direccion_entrega: dist.pedido.direccion_entrega,
              total: dist.pedido.total,
              fecha_estimada: dist.pedido.fecha_estimada
            }
          });
        }
      }
    }

    res.json({
      success: true,
      count: distribucionesExternas.length,
      data: distribucionesExternas
    });

  } catch (error) {
    console.error('Error al obtener distribuciones externas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener distribuciones externas',
      error: error.message
    });
  }
};