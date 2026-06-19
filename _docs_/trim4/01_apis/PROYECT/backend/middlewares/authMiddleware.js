import jwt from 'jsonwebtoken';
import Usuario from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuario.findByPk(decoded.id, {
            attributes: ['id_usuario', 'nombre_completo', 'email', 'estado']
        });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        if (usuario.estado !== 'ACTIVO') {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }
        req.usuario = usuario;
        next();

    } catch (error) {
        console.error('Error en auth middleware: ', error);
        return res.status(401).json({
            success: false,
            message: 'Token invalido o expirado'
        });
    }
};