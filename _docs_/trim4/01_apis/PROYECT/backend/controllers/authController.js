import Usuario from "../models/User.js";
import { generateToken } from "../utils/generadorToken.js";

export const login = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        if (!email || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridas'
            });
        }

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

        const isMatch = await usuario.comparePassword(contrasena);

        if (!isMatch) {
            return res.status(403).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        if (usuario.estado !== 'ACTIVO') {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        const token = generateToken(usuario.id_usuario);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                usuario: {
                    id: usuario.id_usuario,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    roles: usuario.roles.map(rol => rol.nombre)
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en login: ', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};