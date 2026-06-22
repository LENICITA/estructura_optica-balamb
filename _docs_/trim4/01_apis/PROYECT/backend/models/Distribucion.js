//El repartidor ve:
//Pedidos pendientes
//Pedidos en entrega
//Cliente
//Dirección
//Tiempo estimado
//Cantidad de artículos
//Detalles pedido
//El repartidor puede:
//Ver datos completos de entrega
//Ver artículos
//Ver dirección
//Ver teléfono
//Marcar que llegó
//Historial
//El repartidor ve:
//Pedidos entregados
//Pedidos en entrega
//Fecha de entrega

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

import User from './user.js';
import Vehiculo from './Vehiculo.js';

const Distribucion = sequelize.define('Distribucion', {

    id_distribucion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    id_usuario: {
        // repartidor
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'USUARIOS',
            key: 'id_usuario'
        }
    },

    estado: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'PENDIENTE',
        validate: {
            isIn: {
                args: [[
                    'PENDIENTE',
                    'EN_ENTREGA',
                    'ENTREGADO',
                    'CANCELADO'
                ]],
                msg: 'Estado inválido'
            }
        }
    },

    fecha_asignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    fecha_entrega: {
        type: DataTypes.DATE,
        allowNull: true
    },

    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    }

}, {

    tableName: 'DISTRIBUCIONES',
    timestamps: false,

    hooks: {

        beforeCreate: async (distribucion) => {

            distribucion.estado =
                distribucion.estado.toUpperCase();
        },

        beforeUpdate: async (distribucion) => {

            if(distribucion.changed('estado')){

                distribucion.estado =
                    distribucion.estado.toUpperCase();
            }

            if(
                distribucion.estado === 'ENTREGADO'
                && !distribucion.fecha_entrega
            ){
                distribucion.fecha_entrega = new Date();
            }
        }

    }

});

Distribucion.prototype.iniciarEntrega =
async function(){

    this.estado = 'EN_ENTREGA';

    await this.save();

    return this;
};

Distribucion.prototype.marcarEntregado =
async function(){

    this.estado = 'ENTREGADO';

    this.fecha_entrega = new Date();

    await this.save();

    return this;
};

Distribucion.prototype.cancelarEntrega =
async function(observacion){

    this.estado = 'CANCELADO';

    this.observaciones = observacion;

    await this.save();

    return this;
};

Distribucion.obtenerPendientes =
async function(){

    return await this.findAll({

        where:{
            estado:'PENDIENTE'
        }

    });
};

Distribucion.obtenerEnEntrega =
async function(id_usuario){

    return await this.findAll({

        where:{
            id_usuario,
            estado:'EN_ENTREGA'
        }

    });

};

Distribucion.obtenerHistorial =
async function(id_usuario){

    return await this.findAll({

        where:{
            id_usuario,
            estado:'ENTREGADO'
        },

        order:[
            ['fecha_entrega','DESC']
        ]

    });

};

export default Distribucion;