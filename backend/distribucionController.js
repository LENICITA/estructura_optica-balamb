const Delivery = require('../models/delivery');

module.exports = {

    getReadyOrders(req,res){

        Delivery.findReadyOrders((err,data)=>{

            if(err){
                return res.status(500).json({
                    success:false,
                    message:'Error al consultar pedidos'
                });
            }

            return res.status(200).json({
                success:true,
                message:'Pedidos listos para enviar',
                data
            });

        });

    },

    assignVehicle(req,res){

        const delivery = {
            id:req.params.id,
            vehicle:req.body.vehicle
        };

        Delivery.assignVehicle(delivery,(err,data)=>{

            if(err){
                return res.status(500).json({
                    success:false,
                    message:'Error al asignar vehículo'
                });
            }

            return res.status(200).json({
                success:true,
                message:'Vehículo asignado',
                data
            });

        });

    },

    generateRoute(req,res){

        const id = req.params.id;

        Delivery.generateRoute(id,(err,data)=>{

            return res.status(200).json({
                success:true,
                message:'Ruta generada',
                data
            });

        });

    },

    markDelivered(req,res){

        const id = req.params.id;

        Delivery.markDelivered(id,(err,data)=>{

            if(err){
                return res.status(500).json({
                    success:false,
                    message:'Error al actualizar pedido'
                });
            }

            return res.status(200).json({
                success:true,
                message:'Pedido entregado',
                data
            });

        });

    }

};