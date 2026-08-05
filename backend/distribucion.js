const db = require('../config/config');

const Delivery = {};

// Ver pedidos listos para enviar
Delivery.findReadyOrders = (result) => {

    const sql = `
        SELECT *
        FROM deliveries
        WHERE status = 'pendiente'
    `;

    db.query(sql, (err, data) => {

        if(err){
            console.log(err);
            result(err, null);
        }
        else{
            result(null, data);
        }

    });

};

// Asignar vehículo
Delivery.assignVehicle = (delivery, result) => {

    const sql = `
        UPDATE deliveries
        SET vehicle = ?,
            status = 'asignado',
            updated_at = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            delivery.vehicle,
            new Date(),
            delivery.id
        ],
        (err, res) => {

            if(err){
                result(err, null);
            }
            else{
                result(null, res);
            }

        }
    );

};

// Simular ruta
Delivery.generateRoute = (id, result) => {

    const route = `
        Bodega Principal
        → Punto A
        → Punto B
        → Cliente Final
    `;

    result(null,{
        delivery_id:id,
        route
    });

};

// Marcar entregado
Delivery.markDelivered = (id, result) => {

    const sql = `
        UPDATE deliveries
        SET status = 'entregado',
            updated_at = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            new Date(),
            id
        ],
        (err,res) => {

            if(err){
                result(err,null);
            }
            else{
                result(null,res);
            }

        }
    );

};

module.exports = Delivery;