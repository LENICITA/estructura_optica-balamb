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
        type: DataTypes.INTEGER,
        allowNull: false
    },

    estado: {
        type: DataTypes.ENUM(
            'PENDIENTE',
            'EN_ENTREGA',
            'ENTREGADO',
            'CANCELADO'
        ),
        allowNull: false,
        defaultValue: 'PENDIENTE'
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

        beforeCreate: async(distribucion)=>{

            distribucion.estado = 'PENDIENTE';

        }

    }

});

//METODOS DE INSTANCIA

Distribucion.prototype.iniciarEntrega =
async function(){

    this.estado = 'EN_ENTREGA';

    await this.save();

};

Distribucion.prototype.marcarEntregado =
async function(){

    this.estado = 'ENTREGADO';

    this.fecha_entrega = new Date();

    await this.save();

};

Distribucion.prototype.cancelar =
async function(observacion){

    this.estado = 'CANCELADO';

    this.observaciones = observacion;

    await this.save();

};

//METODOS ESTATICOS

Distribucion.obtenerPendientes =
async function(id_usuario){

    return await Distribucion.findAll({

        where:{
            id_usuario,
            estado:'PENDIENTE'
        },

        order:[
            ['fecha_asignacion','DESC']
        ]

    });

};

Distribucion.obtenerEnEntrega =
async function(id_usuario){

    return await Distribucion.findAll({

        where:{
            id_usuario,
            estado:'EN_ENTREGA'
        }

    });

};

Distribucion.obtenerHistorial =
async function(id_usuario){

    return await Distribucion.findAll({

        where:{
            id_usuario
        },

        order:[
            ['fecha_asignacion','DESC']
        ]

    });

};

export default Distribucion;