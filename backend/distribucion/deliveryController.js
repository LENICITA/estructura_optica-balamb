const Delivery = require('../models/distribucion');

module.exports = {

  /**
   * GET /api/distribucion/ready
   * Devuelve los pedidos con estado 'pendiente' listos para asignar.
   */
  getReadyOrders(req, res) {
    Delivery.findReadyOrders((err, data) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al consultar pedidos listos para enviar',
          error: err.message || err
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Pedidos listos para enviar',
        data
      });
    });
  },

  /**
   * PUT /api/distribucion/assign/:id
   * Admin asigna el vehículo al pedido.
   * Body: { vehicle: 'Placa / Modelo', expiresIn: '1h' }
   */
  assignVehicle(req, res) {
    const delivery = {
      id: req.params.id,
      vehicle: req.body.vehicle
    };

    Delivery.assignVehicle(delivery, (err, data) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al asignar vehículo al pedido',
          error: err.message || err
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehículo asignado al pedido',
        data
      });
    });
  },

  /**
   * POST /api/distribucion/generate-code/:id
   * Genera un código temporal para que el repartidor lo solicite al cliente
   * y pueda marcar el pedido como entregado.
   * Body: { expiresIn: '1h' } opcional.
   */
  generateDeliveryCode(req, res) {
    const id = req.params.id;
    const expiresIn = req.body.expiresIn || process.env.DELIVERY_CODE_EXPIRES_IN || '1h';

    Delivery.generateDeliveryCode(id, expiresIn, (err, data) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error al generar el código de entrega',
          error: err.message || err
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Código de entrega generado',
        data
      });
    });
  },

  /**
   * PUT /api/distribucion/delivered/:id
   * Marca el pedido como entregado si el repartidor presenta el token válido.
   * Body: { token: '<código-del-cliente>' }
   */
  markDelivered(req, res) {
    const id = req.params.id;
    const token = req.body.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Debe suministrar el token de entrega del cliente'
      });
    }

    Delivery.markDelivered(id, token, (err, data) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Error al marcar el pedido como entregado',
          error: err
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Pedido marcado como entregado',
        data
      });
    });
  }
};
