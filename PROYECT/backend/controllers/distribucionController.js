//Admin asigna pedido a repartidor
export const asignarPedido = async (req,res) => {

    try{

        const {
            id_pedido,
            id_usuario
        } = req.body;

        const vehiculo =
        await Vehiculo.findOne({

            where:{
                id_usuario
            }

        });

        if(!vehiculo){

            return res.status(404).json({

                success:false,
                message:'El repartidor no tiene vehículo registrado'

            });
        }

        const distribucion =
        await Distribucion.create({

            id_pedido,
            id_usuario,
            id_vehiculo: vehiculo.id_vehiculo

        });

        res.status(201).json({

            success:true,
            data: distribucion

        });

    }catch(error){

        res.status(500).json({

            success:false,
            message:'Error interno'

        });
    }
};

//Repartidor inicia entrega
export const iniciarEntrega =
async (req,res)=>{

    try{

        const distribucion =
        await Distribucion.findByPk(
            req.params.id
        );

        if(!distribucion){

            return res.status(404).json({
                success:false
            });
        }

        await distribucion.iniciarEntrega();

        res.json({

            success:true,
            message:'Entrega iniciada'

        });

    }catch(error){

        res.status(500).json({
            success:false
        });
    }

};

//Repartidor llega a direccion de entrega y marca como entregado
export const marcarEntregado =
async (req,res)=>{

    try{

        const distribucion =
        await Distribucion.findByPk(
            req.params.id
        );

        if(!distribucion){

            return res.status(404).json({
                success:false
            });
        }

        await distribucion.marcarEntregado();

        res.json({

            success:true,
            message:'Pedido entregado'

        });

    }catch(error){

        res.status(500).json({
            success:false
        });
    }

};

//Historial de entregas del repartidors
export const obtenerHistorial =
async (req,res)=>{

    try{

        const historial =
        await Distribucion.obtenerHistorial(
            req.user.id_usuario
        );

        res.json({

            success:true,
            data: historial

        });

    }catch(error){

        res.status(500).json({
            success:false
        });
    }

};