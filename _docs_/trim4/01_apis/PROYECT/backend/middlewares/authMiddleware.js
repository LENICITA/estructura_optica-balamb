import jwt from 'jsonwebtoken';
import { Usuario } from '../models/relaciones.js';

export const authMiddleware = async (req, res, next) => {
    try {
        console.log('Headers recibidos:', req.headers);
        
        const authHeader = req.headers.authorization;
        console.log('authHeader:', authHeader);
        
        if (!authHeader) {
            console.log('No hay header Authorization');
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }

        // Verificar que empiece con 'Bearer '
        if (!authHeader.startsWith('Bearer ')) {
            console.log('Header no empieza con Bearer');
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido. Debe ser: Bearer <token>'
            });
        }

        // Extraer el token
        const token = authHeader.split(' ')[1];
        console.log('Token extraído:', token ? token.substring(0, 30) + '...' : 'No token');

        // Verificar que el token no esté vacío
        if (!token || token === 'null' || token === 'undefined' || token === '') {
            console.log('❌ Token vacío o inválido');
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Verificar JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está definido en .env');
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
            });
        }

        // Verificar el token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decodificado:', decoded);
        } catch (jwtError) {
            console.error('Error al verificar token:', jwtError.message);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado. Por favor, inicia sesión nuevamente'
                });
            }
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token inválido. Por favor, inicia sesión nuevamente'
                });
            }
            
            throw jwtError;
        }

        // Verificar que el token tenga el campo 'id'
        if (!decoded.id) {
            console.log('❌ Token no contiene campo "id"');
            return res.status(401).json({
                success: false,
                message: 'Token inválido: no contiene ID de usuario'
            });
        }

        // Buscar el usuario en la base de datos
        const usuario = await Usuario.findByPk(decoded.id, {
            attributes: ['id_usuario', 'nombre_completo', 'email', 'estado', 'ciudad']
        });

        if (!usuario) {
            console.log('Usuario no encontrado en BD');
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Verificar estado del usuario
        if (usuario.estado !== 'ACTIVO') {
            console.log('Usuario inactivo');
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo. Contacta al administrador.'
            });
        }

        // Guardar usuario en req.user
        req.user = {
            id: usuario.id_usuario,
            nombre_completo: usuario.nombre_completo,
            email: usuario.email,
            estado: usuario.estado,
            ciudad: usuario.ciudad
        };
        
        console.log(`Usuario autenticado: ${req.user.nombre_completo} (ID: ${req.user.id})`);
        next();

    } catch (error) {
        console.error('❌ Error en auth middleware:', error);
        return res.status(401).json({
            success: false,
            message: 'Error al autenticar usuario'
        });
    }
};