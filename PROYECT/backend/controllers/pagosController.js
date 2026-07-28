const PagoModel = require('../models/pagoModel');
const db = require('../config/db');

// Obtener todos los pagos
const obtenerPagos = async (req, res) => {
  try {
    const pagos = await PagoModel.obtenerTodos();
    res.json({ success: true, count: pagos.length, data: pagos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los pagos', error: error.message });
  }
};

// Obtener pago por ID
const obtenerPagoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    res.json({ success: true, data: pago });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el pago', error: error.message });
  }
};

// Obtener pagos por pedido
const obtenerPagosPorPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const pagos = await PagoModel.obtenerPorPedido(pedidoId);
    res.json({ success: true, count: pagos.length, data: pagos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los pagos del pedido', error: error.message });
  }
};

// Crear un pago
const crearPago = async (req, res) => {
  try {
    const { id_pedido, eleccion_pago, canal_pago, monto } = req.body;
    
    if (!id_pedido || !eleccion_pago || !canal_pago || !monto) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }
    if (monto <= 0) {
      return res.status(400).json({ success: false, message: 'El monto debe ser mayor a 0' });
    }
    
    const [pedido] = await db.promise().query('SELECT * FROM PEDIDOS WHERE id_pedido = ?', [id_pedido]);
    if (pedido.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
    if (monto > pedido[0].total) {
      return res.status(400).json({ success: false, message: `El monto del pago excede el total del pedido` });
    }
    
    const [pagosExistentes] = await db.promise().query('SELECT * FROM PAGOS WHERE id_pedido = ? AND estado = "Confirmado"', [id_pedido]);
    if (pagosExistentes.length > 0) {
      return res.status(400).json({ success: false, message: 'Este pedido ya tiene un pago confirmado' });
    }
    
    const nuevoId = await PagoModel.crear({ id_pedido, eleccion_pago, canal_pago, monto, estado: 'Pendiente' });
    const nuevoPago = await PagoModel.obtenerPorId(nuevoId);
    res.status(201).json({ success: true, message: 'Pago registrado exitosamente', data: nuevoPago });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear el pago', error: error.message });
  }
};

// Actualizar pago
const actualizarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { eleccion_pago, canal_pago, monto, estado } = req.body;
    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    if (pago.estado === 'Confirmado') {
      return res.status(400).json({ success: false, message: 'No se puede modificar un pago ya confirmado' });
    }
    const actualizado = await PagoModel.actualizar(id, { eleccion_pago, canal_pago, monto, estado });
    if (!actualizado) return res.status(400).json({ success: false, message: 'No se pudo actualizar el pago' });
    const pagoActualizado = await PagoModel.obtenerPorId(id);
    res.json({ success: true, message: 'Pago actualizado exitosamente', data: pagoActualizado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar el pago', error: error.message });
  }
};

// Confirmar pago
const confirmarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    if (pago.estado === 'Confirmado') return res.status(400).json({ success: false, message: 'El pago ya está confirmado' });
    if (pago.estado === 'Reembolsado') return res.status(400).json({ success: false, message: 'No se puede confirmar un pago reembolsado' });
    
    await PagoModel.actualizarEstado(id, 'Confirmado');
    await db.promise().query('UPDATE PEDIDOS SET estado = "Pagado" WHERE id_pedido = ?', [pago.id_pedido]);
    const pagoActualizado = await PagoModel.obtenerPorId(id);
    res.json({ success: true, message: 'Pago confirmado exitosamente', data: pagoActualizado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al confirmar el pago', error: error.message });
  }
};

// Rechazar pago
const rechazarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    if (pago.estado === 'Confirmado') return res.status(400).json({ success: false, message: 'No se puede rechazar un pago ya confirmado' });
    
    await PagoModel.actualizarEstado(id, 'Rechazado');
    const pagoActualizado = await PagoModel.obtenerPorId(id);
    res.json({ success: true, message: 'Pago rechazado', motivo: motivo || 'No especificado', data: pagoActualizado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al rechazar el pago', error: error.message });
  }
};

// Reembolsar pago
const reembolsarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    if (pago.estado !== 'Confirmado') return res.status(400).json({ success: false, message: 'Solo se pueden reembolsar pagos confirmados' });
    
    await PagoModel.actualizarEstado(id, 'Reembolsado');
    await db.promise().query('UPDATE PEDIDOS SET estado = "Reembolsado" WHERE id_pedido = ?', [pago.id_pedido]);
    const pagoActualizado = await PagoModel.obtenerPorId(id);
    res.json({ success: true, message: 'Pago reembolsado exitosamente', data: pagoActualizado });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al reembolsar el pago', error: error.message });
  }
};

// Eliminar pago
const eliminarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const pago = await PagoModel.obtenerPorId(id);
    if (!pago) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
    if (pago.estado === 'Confirmado') return res.status(400).json({ success: false, message: 'No se puede eliminar un pago confirmado' });
    
    const eliminado = await PagoModel.eliminar(id);
    if (!eliminado) return res.status(400).json({ success: false, message: 'No se pudo eliminar el pago' });
    res.json({ success: true, message: 'Pago eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar el pago', error: error.message });
  }
};

// Estadísticas
const obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await PagoModel.obtenerEstadisticas();
    const [pagosPorMetodo] = await db.promise().query(`
      SELECT eleccion_pago, COUNT(*) as cantidad, SUM(monto) as total
      FROM PAGOS WHERE estado = 'Confirmado' GROUP BY eleccion_pago
    `);
    res.json({ success: true, data: { resumen: estadisticas, pagos_por_metodo: pagosPorMetodo } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Pagos por rango de fechas
const obtenerPagosPorRangoFechas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) return res.status(400).json({ success: false, message: 'Se requieren fechaInicio y fechaFin' });
    const pagos = await PagoModel.obtenerPorRangoFechas(fechaInicio, fechaFin);
    res.json({ success: true, count: pagos.length, data: pagos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener pagos por fechas', error: error.message });
  }
};

module.exports = {
  obtenerPagos,
  obtenerPagoPorId,
  obtenerPagosPorPedido,
  crearPago,
  actualizarPago,
  confirmarPago,
  rechazarPago,
  reembolsarPago,
  eliminarPago,
  obtenerEstadisticas,
  obtenerPagosPorRangoFechas
};