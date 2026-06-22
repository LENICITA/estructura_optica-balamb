import Distribucion from '../models/Distribucion.js';

// Admin asigna pedido a repartidor
export const asignarPedido = async (req, res) => {
    try {
        const { id_pedido, id_usuario } = req.body;

        const distribucion = await Distribucion.create({
            id_pedido,
            id_usuario
        });

        res.status(201).json({
            success: true,
            data: distribucion
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Error interno'
        });
    }
};

// Repartidor inicia entrega
export const iniciarEntrega = async (req, res) => {
    try {
        const distribucion = await Distribucion.findByPk(req.params.id);

        if (!distribucion) {
            return res.status(404).json({
                success: false,
                message: 'Distribución no encontrada'
            });
        }

        await distribucion.iniciarEntrega();

        res.json({
            success: true,
            message: 'Entrega iniciada'
        });

    } catch (error) {
        res.status(500).json({
            success: false
        });
    }
};

// Repartidor marca entregado
export const marcarEntregado = async (req, res) => {
    try {
        const distribucion = await Distribucion.findByPk(req.params.id);

        if (!distribucion) {
            return res.status(404).json({
                success: false
            });
        }

        await distribucion.marcarEntregado();

        res.json({
            success: true,
            message: 'Pedido entregado'
        });

    } catch (error) {
        res.status(500).json({
            success: false
        });
    }
};

// Pedidos pendientes del repartidor
export const obtenerPendientes = async (req, res) => {
    try {
        const pendientes = await Distribucion.obtenerPendientes(
            req.usuario.id_usuario   // ✅ FIX
        );

        res.json({
            success: true,
            data: pendientes
        });

    } catch (error) {
        res.status(500).json({
            success: false
        });
    }
};

// Pedidos en entrega del repartidor
export const obtenerEnEntrega = async (req, res) => {
    try {
        const pedidos = await Distribucion.obtenerEnEntrega(
            req.usuario.id_usuario   // ✅ FIX
        );

        res.json({
            success: true,
            data: pedidos
        });

    } catch (error) {
        res.status(500).json({
            success: false
        });
    }
};

// Historial del repartidor
export const obtenerHistorial = async (req, res) => {
    try {
        const historial = await Distribucion.obtenerHistorial(
            req.usuario.id_usuario   // ✅ FIX
        );

        res.json({
            success: true,
            data: historial
        });

    } catch (error) {
        res.status(500).json({
            success: false
        });
    }
};