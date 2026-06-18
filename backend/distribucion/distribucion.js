require('dotenv').config();
const db = require('../config/config');
const jwt = require('jsonwebtoken');

const Delivery = {};

Delivery.ensureDeliveryCodeColumns = (callback) => {
  const sqls = [
    "ALTER TABLE deliveries ADD COLUMN delivery_code VARCHAR(512) NULL",
    "ALTER TABLE deliveries ADD COLUMN delivery_code_expires_at DATETIME NULL"
  ];

  const run = (index) => {
    if (index >= sqls.length) {
      return callback(null);
    }

    db.query(sqls[index], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          return run(index + 1);
        }
        return callback(err);
      }
      run(index + 1);
    });
  };

  run(0);
};

Delivery.findReadyOrders = (result) => {
  const sql = `
    SELECT *
    FROM deliveries
    WHERE status = 'pendiente'
  `;

  db.query(sql, (err, data) => {
    if (err) {
      console.error('Error en findReadyOrders:', err);
      return result(err, null);
    }
    result(null, data);
  });
};

Delivery.assignVehicle = (delivery, result) => {
  const sql = `
    UPDATE deliveries
    SET vehicle = ?,
        status = 'asignado',
        updated_at = ?
    WHERE id = ?
  `;

  db.query(sql, [delivery.vehicle, new Date(), delivery.id], (err, res) => {
    if (err) {
      return result(err, null);
    }
    result(null, res);
  });
};

Delivery.generateRoute = (id, result) => {
  const route = `
    Bodega Principal
    → Punto A
    → Punto B
    → Cliente Final
  `;

  result(null, {
    delivery_id: id,
    route
  });
};

Delivery.generateDeliveryCode = (id, expiresIn, result) => {
  if (!process.env.JWT_SECRET) {
    return result(new Error('JWT_SECRET no está configurado'), null);
  }

  Delivery.ensureDeliveryCodeColumns((err) => {
    if (err) {
      console.error('Error en ensureDeliveryCodeColumns:', err);
      return result(err, null);
    }

    let token;
    try {
      token = jwt.sign({ deliveryId: id }, process.env.JWT_SECRET, {
        expiresIn
      });
    } catch (signError) {
      return result(signError, null);
    }

    const expiresAt = new Date(Date.now() + Delivery.parseDuration(expiresIn));
    const sql = `
      UPDATE deliveries
      SET delivery_code = ?,
          delivery_code_expires_at = ?,
          updated_at = ?
      WHERE id = ?
    `;

    db.query(sql, [token, expiresAt, new Date(), id], (err, res) => {
      if (err) {
        return result(err, null);
      }

      result(null, {
        delivery_id: id,
        delivery_code: token,
        expiresAt
      });
    });
  });
};

Delivery.markDelivered = (id, token, result) => {
  if (!process.env.JWT_SECRET) {
    return result(new Error('JWT_SECRET no está configurado'), null);
  }

  const sql = `
    SELECT delivery_code, delivery_code_expires_at
    FROM deliveries
    WHERE id = ?
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) {
      return result(err, null);
    }

    if (!rows || rows.length === 0) {
      return result(new Error('Pedido no encontrado'), null);
    }

    const delivery = rows[0];
    if (!delivery.delivery_code) {
      return result(new Error('No existe un código de entrega generado para este pedido'), null);
    }

    if (delivery.delivery_code !== token) {
      return result(new Error('Token de entrega inválido'), null);
    }

    if (
      delivery.delivery_code_expires_at &&
      new Date(delivery.delivery_code_expires_at) < new Date()
    ) {
      return result(new Error('Token de entrega expirado'), null);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (parseInt(decoded.deliveryId, 10) !== parseInt(id, 10)) {
        return result(new Error('Token de entrega no corresponde a este pedido'), null);
      }
    } catch (verifyError) {
      return result(new Error(verifyError.message || 'Token inválido'), null);
    }

    const updateSql = `
      UPDATE deliveries
      SET status = 'entregado',
          updated_at = ?,
          delivery_code = NULL,
          delivery_code_expires_at = NULL
      WHERE id = ?
    `;

    db.query(updateSql, [new Date(), id], (err, res) => {
      if (err) {
        return result(err, null);
      }
      result(null, res);
    });
  });
};

Delivery.parseDuration = (duration) => {
  const match = /^([0-9]+)\s*(s|m|h|d)?$/i.exec(duration);
  if (!match) {
    return 3600000;
  }

  const value = parseInt(match[1], 10);
  const unit = (match[2] || 'h').toLowerCase();

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return value * 60 * 60 * 1000;
  }
};

module.exports = Delivery;
