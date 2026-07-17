import PagoModel from '../models/pagoModel.js';
import sequelize from '../config/database.js';
import boldClient from '../config/bold.js';

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
    const usuario = req.user;

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

    // VERIFICAR QUE EL PEDIDO PERTENEZCA AL USUARIO

    if (pedido.id_usuario !== usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No puedes pagar un pedido que no te pertenece'
      });
    }

    // Verificar que el monto no exceda el total del pedido
    if (monto > pedido.total) {
      return res.status(400).json({ 
        success: false, 
        message: `El monto no puede exceder el total del pedido (${pedido.total})` 
      });
    }

    // Verificar el estado del pedido
    if (pedido.estado === 'Pagado') {
      return res.status(400).json({
        success: false,
        message: 'Este pedido ya está pagado completamente'
      });
    }

    // ===== LÓGICA PARA 50% =====
    if (eleccion_pago === '50%') {
      const totalPagado = await PagoModel.obtenerTotalPagado(id_pedido);
      const saldoRestante = pedido.total - totalPagado;
      
      // Verificar si ya tiene un abono del 50%
      const tieneAbono = await PagoModel.tieneAbono50(id_pedido);
      
      if (tieneAbono) {
        // Si ya tiene abono, este es el segundo pago del 50%
        if (pedido.estado !== 'Abonado') {
          return res.status(400).json({
            success: false,
            message: 'El pedido debe estar en estado ABONADO para pagar el saldo restante'
          });
        }
        
        // Verificar que el monto sea el saldo restante
        if (monto < saldoRestante) {
          return res.status(400).json({
            success: false,
            message: `El saldo restante es ${saldoRestante}. Debes pagar esa cantidad para completar el pago`
          });
        }
      } else {
        // Primer pago del 50% - verificar que no tenga pago completo
        const tieneCompleto = await PagoModel.tienePagoCompleto(id_pedido);
        if (tieneCompleto) {
          return res.status(400).json({
            success: false,
            message: 'Este pedido ya fue pagado completamente'
          });
        }
        
        // El monto debe ser aproximadamente el 50% del total
        const monto50Esperado = pedido.total / 2;
        const margenError = 100; // Permitir margen de error de 100 unidades
        if (Math.abs(monto - monto50Esperado) > margenError) {
          return res.status(400).json({
            success: false,
            message: `El monto debe ser aproximadamente el 50% del total (${monto50Esperado})`
          });
        }
      }
    }

    // ===== LÓGICA PARA 100% =====
    if (eleccion_pago === '100%') {
      const totalPagado = await PagoModel.obtenerTotalPagado(id_pedido);
      const saldoRestante = pedido.total - totalPagado;
      
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
        if (monto < saldoRestante) {
          return res.status(400).json({
            success: false,
            message: `El saldo restante es ${saldoRestante}. Debes pagar esa cantidad para completar`
          });
        }
      } else {
        // Pago completo de una vez - debe ser el total del pedido
        if (Math.abs(monto - pedido.total) > 100) {
          return res.status(400).json({
            success: false,
            message: `El monto debe ser el total del pedido (${pedido.total}) para pago completo`
          });
        }
      }
    }

    // ==========================================
    // CONEXIÓN CON BOLD
    // ==========================================

    // Calcular IVA (19%)
    const valorIva = Math.round(monto * 0.19);
    const baseGravable = monto - valorIva;

    // Crear link de pago en Bold
    const boldResponse = await boldClient.post('/online/link/v1', {
      amount_type: "CLOSE",
      amount: {
        currency: "COP",
        total_amount: monto,
        taxes: [
          {
            type: "VAT",
            base: baseGravable,
            value: valorIva
          }
        ],
        tip_amount: 0
      },
      reference: `${id_pedido}-${eleccion_pago}-${Date.now()}`,
      description: `Pago ${eleccion_pago} del pedido #${id_pedido}`,
      payer_email: usuario.email || 'cliente@email.com'
    });

    // Extraer datos de la respuesta de Bold
    const { payment_link, url: bold_link } = boldResponse.data.payload;


    // Crear el pago
    const nuevoId = await PagoModel.crear({ 
      id_pedido, 
      eleccion_pago, 
      canal_pago, 
      monto,
      bold_reference: payment_link,
      bold_link: bold_link
    });

    const nuevoPago = await PagoModel.obtenerPorId(nuevoId);
    res.status(201).json({ 
      success: true, 
      message: 'Link de pago generado exitosamente',
      data: {
        id_pago: nuevoId,
        bold_link: bold_link, 
        bold_reference: payment_link
      }
    });

  } catch (error) {
    console.error('Error al crear pago:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Error al crear el pago', error: error.response?.data || error.message });
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

    // Confirmar pago
    await PagoModel.confirmarPago(id);

    const pagoActualizado = await PagoModel.obtenerPorId(id);
    
    // Obtener el estado actual del pedido
    const [pedido] = await sequelize.query(
      'SELECT estado FROM PEDIDOS WHERE id_pedido = ?',
      { replacements: [pago.id_pedido], type: sequelize.QueryTypes.SELECT }
    );

    // Determinar mensaje según el caso
    let mensaje = '';
    if (pedido.estado === 'Pagado') {
      mensaje = 'El pedido ha sido pagado completamente';
    } else if (pedido.estado === 'Abonado') {
      mensaje = 'Abono del 50% confirmado. El pedido está en estado ABONADO';
    } else {
      mensaje = `Pago confirmado. Estado actual del pedido: ${pedido.estado}`;
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

