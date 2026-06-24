import { Usuario } from "../models/relaciones.js";
import { generateToken } from "../utils/generadorToken.js";
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        if (!email || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridas'
            });
        }

        // Buscar usuario con roles
        const usuario = await Usuario.findOne({
            where: { email },
            include: ['roles']
        });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        console.log('Contraseña correcta:', isMatch);

        if (!isMatch) {
            return res.status(403).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        // Verificar estado
        if (usuario.estado !== 'ACTIVO') {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Generar token
        const token = generateToken(usuario.id_usuario);

        // Preparar respuesta con roles
        let roles = [];
        if (usuario.roles && Array.isArray(usuario.roles)) {
            roles = usuario.roles.map(rol => rol.nombre);
        }

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                usuario: {
                    id: usuario.id_usuario,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    roles: roles
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en login: ', error);
        console.error('Detalles:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};