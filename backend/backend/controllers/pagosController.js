import PagoModel from '../models/pagoModel.js';
import sequelize from '../config/database.js';

// ========== OBTENER TODOS LOS PAGOS (ADMIN) ==========
export const obtenerPagos = async (req, res) => {
  try {
    const pagos = await PagoModel.obtenerTodos();
    res.json({ success: true, count: pagos.length, data: pagos });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los pagos', error: error.message });
  }
};

// ========== OBTENER PAGO POR ID ==========
export const obtenerPagoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }
    res.json({ success: true, data: pago });
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el pago', error: error.message });
  }
};

// ========== OBTENER PAGOS POR PEDIDO ==========
export const obtenerPagosPorPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const pagos = await PagoModel.obtenerPorPedido(pedidoId);
    const totalPagado = await PagoModel.obtenerTotalPagado(pedidoId);
    const tieneCompleto = await PagoModel.tienePagoCompletoPorSuma(pedidoId);
    
    res.json({ 
      success: true, 
      count: pagos.length, 
      total_pagado: totalPagado,
      pagado_completo: tieneCompleto,
      data: pagos 
    });
  } catch (error) {
    console.error('Error al obtener pagos del pedido:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los pagos del pedido', error: error.message });
  }
};

// ========== CREAR PAGO (CLIENTE) ==========
export const crearPago = async (req, res) => {
  try {
    const { id_pedido, eleccion_pago, canal_pago = 'Bold', monto } = req.body;

    // Validar campos requeridos
    if (!id_pedido || !eleccion_pago || !monto) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan campos requeridos: id_pedido, eleccion_pago, monto' 
      });
    }

    // Validar elección de pago
    if (!['50%', '100%'].includes(eleccion_pago)) {
      return res.status(400).json({ 
        success: false, 
        message: 'eleccion_pago debe ser 50% o 100%' 
      });
    }

    // Verificar que el pedido existe
    const [pedido] = await sequelize.query(
      'SELECT * FROM PEDIDOS WHERE id_pedido = ?',
      { replacements: [id_pedido], type: sequelize.QueryTypes.SELECT }
    );

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // Verificar que el monto no exceda el total del pedido
    if (monto > pedido.total) {
      return res.status(400).json({ 
        success: false, 
        message: `El monto no puede exceder el total del pedido (${pedido.total})` 
      });
    }

    // ===== LÓGICA PARA 50% (PRIMER Y SEGUNDO PAGO) =====
    if (eleccion_pago === '50%') {
      // Verificar si ya tiene un abono del 50%
      const tieneAbono = await PagoModel.tieneAbono50(id_pedido);
      
      if (tieneAbono) {
        // Si ya tiene abono, debe estar en estado 'Listo' para pagar el saldo
        if (pedido.estado !== 'Listo') {
          return res.status(400).json({
            success: false,
            message: 'El pedido debe estar en estado LISTO para pagar el saldo restante'
          });
        }
        //  Permitir el segundo pago del 50% (saldo restante)
      } else {
        // Primer pago del 50% - verificar que no tenga pago completo previo
        const tieneCompleto = await PagoModel.tienePagoCompleto(id_pedido);
        if (tieneCompleto) {
          return res.status(400).json({
            success: false,
            message: 'Este pedido ya fue pagado completamente'
          });
        }
        // Permitir el primer pago del 50%
      }
    }

    // ===== LÓGICA PARA 100% =====
    if (eleccion_pago === '100%') {
      // Verificar que no tenga pago completo previo
      const tieneCompleto = await PagoModel.tienePagoCompleto(id_pedido);
      if (tieneCompleto) {
        return res.status(400).json({ 
          success: false, 
          message: 'Este pedido ya fue pagado completamente' 
        });
      }

      // Verificar si ya tiene abono del 50% (para pago de saldo completo)
      const tieneAbono = await PagoModel.tieneAbono50(id_pedido);
      if (tieneAbono) {
        const totalPagado = await PagoModel.obtenerTotalPagado(id_pedido);
        const saldoRestante = pedido.total - totalPagado;
        
        if (monto < saldoRestante) {
          return res.status(400).json({
            success: false,
            message: `El saldo restante es ${saldoRestante}. Debes pagar esa cantidad para completar`
          });
        }
        // Permitir pago del saldo restante en un solo pago
      }
    }

    // Crear el pago
    const nuevoId = await PagoModel.crear({ 
      id_pedido, 
      eleccion_pago, 
      canal_pago, 
      monto 
    });

    const nuevoPago = await PagoModel.obtenerPorId(nuevoId);
    res.status(201).json({ 
      success: true, 
      message: 'Pago registrado exitosamente. Esperando confirmación de Bold', 
      data: nuevoPago 
    });

  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ success: false, message: 'Error al crear el pago', error: error.message });
  }
};

// ========== CONFIRMAR PAGO (WEBHOOK DE BOLD) ==========
export const confirmarPago = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

    if (pago.estado === 'Confirmado') {
      return res.status(400).json({ success: false, message: 'El pago ya está confirmado' });
    }

    // Confirmar pago (esto actualiza el estado del pedido según 50% o 100%)
    await PagoModel.confirmarPago(id);

    const pagoActualizado = await PagoModel.obtenerPorId(id);
    
    // Determinar mensaje según el caso
    let mensaje = '';
    if (pago.eleccion_pago === '100%') {
      mensaje = 'Pago completo confirmado. El pedido está en estado PAGADO';
    } else if (pago.eleccion_pago === '50%') {
      // Verificar si es el primer o segundo pago del 50%
      const tieneAbonoPrevio = await PagoModel.tieneAbono50Previo(pago.id_pedido, pago.id_pago);
      mensaje = tieneAbonoPrevio 
        ? 'Saldo del 50% confirmado. El pedido está en estado PAGADO'
        : 'Abono del 50% confirmado. El pedido está en estado ABONADO';
    }

    res.json({ 
      success: true, 
      message: mensaje,
      data: pagoActualizado 
    });

  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ success: false, message: 'Error al confirmar el pago', error: error.message });
  }
};

// ========== RECHAZAR PAGO (WEBHOOK DE BOLD) ==========
export const rechazarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) {
      return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    }

    if (pago.estado === 'Confirmado') {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede rechazar un pago ya confirmado' 
      });
    }

    await PagoModel.rechazarPago(id);

    const pagoActualizado = await PagoModel.obtenerPorId(id);
    res.json({ 
      success: true, 
      message: 'Pago rechazado', 
      motivo: motivo || 'No especificado', 
      data: pagoActualizado 
    });

  } catch (error) {
    console.error('Error al rechazar pago:', error);
    res.status(500).json({ success: false, message: 'Error al rechazar el pago', error: error.message });
  }
};

// ========== OBTENER ESTADÍSTICAS (ADMIN) ==========
export const obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await PagoModel.obtenerEstadisticas();

    // Pagos por método (50% o 100%)
    const pagosPorMetodo = await sequelize.query(
      `SELECT eleccion_pago, COUNT(*) as cantidad, SUM(monto) as total
       FROM PAGOS 
       WHERE estado = 'Confirmado' 
       GROUP BY eleccion_pago`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({ 
      success: true, 
      data: { 
        resumen: estadisticas, 
        pagos_por_metodo: pagosPorMetodo 
      } 
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: error.message });
  }
};

// ========== OBTENER PAGOS POR RANGO DE FECHAS (ADMIN) ==========
export const obtenerPagosPorRangoFechas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren fechaInicio y fechaFin' 
      });
    }

    const pagos = await PagoModel.obtenerPorRangoFechas(fechaInicio, fechaFin);
    res.json({ success: true, count: pagos.length, data: pagos });

  } catch (error) {
    console.error('Error al obtener pagos por fechas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener pagos por fechas', error: error.message });
  }
};

// ========== VERIFICAR SALDO DE PEDIDO ==========
export const verificarSaldoPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    const [pedido] = await sequelize.query(
      'SELECT * FROM PEDIDOS WHERE id_pedido = ?',
      { replacements: [pedidoId], type: sequelize.QueryTypes.SELECT }
    );

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    const totalPagado = await PagoModel.obtenerTotalPagado(pedidoId);
    const tieneAbono = await PagoModel.tieneAbono50(pedidoId);
    const tieneCompleto = await PagoModel.tienePagoCompleto(pedidoId);
    const saldoPendiente = pedido.total - totalPagado;

    let estadoPago = 'SIN_PAGO';
    if (tieneCompleto || saldoPendiente <= 0) {
      estadoPago = 'PAGADO_COMPLETO';
    } else if (tieneAbono) {
      estadoPago = 'ABONADO_50';
    }

    res.json({
      success: true,
      data: {
        total_pedido: pedido.total,
        total_pagado: totalPagado,
        saldo_pendiente: saldoPendiente,
        estado_pago: estadoPago,
        tiene_abono_50: tieneAbono,
        tiene_pago_completo: tieneCompleto
      }
    });

  } catch (error) {
    console.error('Error al verificar saldo:', error);
    res.status(500).json({ success: false, message: 'Error al verificar saldo', error: error.message });
  }
};