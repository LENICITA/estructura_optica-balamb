const db = require('../config/db');

const PagoModel = {
  // Crear un nuevo pago
  crear: async (pagoData) => {
    const { id_pedido, eleccion_pago, canal_pago, monto, estado } = pagoData;
    const query = `
      INSERT INTO PAGOS (id_pedido, fecha_pago, eleccion_pago, canal_pago, monto, estado)
      VALUES (?, CURDATE(), ?, ?, ?, ?)
    `;
    const values = [id_pedido, eleccion_pago, canal_pago, monto, estado || 'Pendiente'];
    
    const [result] = await db.promise().query(query, values);
    return result.insertId;
  },

  // Obtener todos los pagos
  obtenerTodos: async () => {
    const query = `
      SELECT p.*, pe.total as total_pedido
      FROM PAGOS p
      JOIN PEDIDOS pe ON p.id_pedido = pe.id_pedido
      ORDER BY p.fecha_pago DESC
    `;
    const [rows] = await db.promise().query(query);
    return rows;
  },

  // Obtener pago por ID
  obtenerPorId: async (id_pago) => {
    const query = `
      SELECT p.*, pe.total as total_pedido
      FROM PAGOS p
      JOIN PEDIDOS pe ON p.id_pedido = pe.id_pedido
      WHERE p.id_pago = ?
    `;
    const [rows] = await db.promise().query(query, [id_pago]);
    return rows[0];
  },

  // Obtener pagos por pedido
  obtenerPorPedido: async (id_pedido) => {
    const query = `
      SELECT * FROM PAGOS 
      WHERE id_pedido = ?
      ORDER BY fecha_pago DESC
    `;
    const [rows] = await db.promise().query(query, [id_pedido]);
    return rows;
  },

  // Actualizar un pago
  actualizar: async (id_pago, datos) => {
    const campos = [];
    const valores = [];
    
    if (datos.eleccion_pago) {
      campos.push('eleccion_pago = ?');
      valores.push(datos.eleccion_pago);
    }
    if (datos.canal_pago) {
      campos.push('canal_pago = ?');
      valores.push(datos.canal_pago);
    }
    if (datos.monto) {
      campos.push('monto = ?');
      valores.push(datos.monto);
    }
    if (datos.estado) {
      campos.push('estado = ?');
      valores.push(datos.estado);
    }
    
    if (campos.length === 0) return false;
    
    valores.push(id_pago);
    const query = `UPDATE PAGOS SET ${campos.join(', ')} WHERE id_pago = ?`;
    const [result] = await db.promise().query(query, valores);
    return result.affectedRows > 0;
  },

  // Actualizar solo el estado
  actualizarEstado: async (id_pago, estado) => {
    const query = 'UPDATE PAGOS SET estado = ? WHERE id_pago = ?';
    const [result] = await db.promise().query(query, [estado, id_pago]);
    return result.affectedRows > 0;
  },

  // Eliminar un pago
  eliminar: async (id_pago) => {
    const query = 'DELETE FROM PAGOS WHERE id_pago = ?';
    const [result] = await db.promise().query(query, [id_pago]);
    return result.affectedRows > 0;
  },

  // Estadísticas
  obtenerEstadisticas: async () => {
    const query = `
      SELECT 
        SUM(CASE WHEN estado = 'Confirmado' THEN monto ELSE 0 END) as total_recaudado,
        SUM(CASE WHEN estado = 'Pendiente' THEN monto ELSE 0 END) as total_pendiente,
        COUNT(CASE WHEN estado = 'Confirmado' THEN 1 END) as pagos_confirmados,
        COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as pagos_pendientes,
        COUNT(CASE WHEN estado = 'Rechazado' THEN 1 END) as pagos_rechazados,
        COUNT(CASE WHEN estado = 'Reembolsado' THEN 1 END) as pagos_reembolsados
      FROM PAGOS
    `;
    const [rows] = await db.promise().query(query);
    return rows[0];
  },

  // Pagos por rango de fechas
  obtenerPorRangoFechas: async (fechaInicio, fechaFin) => {
    const query = `
      SELECT p.*, pe.total as total_pedido
      FROM PAGOS p
      JOIN PEDIDOS pe ON p.id_pedido = pe.id_pedido
      WHERE p.fecha_pago BETWEEN ? AND ?
      ORDER BY p.fecha_pago DESC
    `;
    const [rows] = await db.promise().query(query, [fechaInicio, fechaFin]);
    return rows;
  }
};

module.exports = PagoModel;