// controllers/authController.js
import { Usuario, Role, RolUsuario } from "../models/relaciones.js";
import sequelize from "../config/database.js";
import { generateToken } from "../utils/generadorToken.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { createTransport } from 'nodemailer';

// LOGIN
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
            where: { email: email.toLowerCase() },
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
                attributes: ['nombre']
            }]
        });

        if (!usuario) {
            console.log('Usuario no encontrado:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const isMatch = await usuario.comparePassword(contrasena);
        console.log('¿Contraseña correcta?', isMatch);

        if (!isMatch) {
            console.log('Contraseña incorrecta para:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        if (usuario.estado !== 'ACTIVO') {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo. Contacta al administrador.'
            });
        }

        const token = generateToken(usuario.id_usuario);
        const roles = usuario.roles?.map(rol => rol.nombre) || [];

        console.log(`Login exitoso: ${usuario.nombre_completo}`);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                usuario: {
                    id: usuario.id_usuario,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    ciudad: usuario.ciudad,
                    roles: roles
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// REGISTER
export const register = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const {
            nombre_completo,
            telefono,
            fecha_nacimiento,
            documento,
            ciudad,
            direccion,
            email,
            contrasena,
            rol = 'CLIENTE'
        } = req.body;

        if (!nombre_completo || !email || !contrasena) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Nombre, email y contraseña son requeridos'
            });
        }

        if (contrasena.length < 8) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        const emailExistente = await Usuario.findOne({
            where: { email: email.toLowerCase() },
            transaction
        });

        if (emailExistente) {
            await transaction.rollback();
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        if (documento) {
            const documentoExistente = await Usuario.findOne({
                where: { documento },
                transaction
            });

            if (documentoExistente) {
                await transaction.rollback();
                return res.status(409).json({
                    success: false,
                    message: 'El documento ya está registrado'
                });
            }
        }

        const usuario = await Usuario.create({
            nombre_completo,
            telefono: telefono || '',
            fecha_nacimiento: fecha_nacimiento || null,
            documento: documento || null,
            ciudad: ciudad || '',
            direccion: direccion || '',
            email: email.toLowerCase(),
            contrasena,
            estado: 'ACTIVO'
        }, { transaction });

        const rolEncontrado = await Role.findOne({
            where: { nombre: rol.toUpperCase() },
            transaction
        });

        if (rolEncontrado) {
            await RolUsuario.create({
                id_usuario: usuario.id_usuario,
                id_rol: rolEncontrado.id_rol
            }, { transaction });
        } else {
            const rolCliente = await Role.findOne({
                where: { nombre: 'CLIENTE' },
                transaction
            });
            if (rolCliente) {
                await RolUsuario.create({
                    id_usuario: usuario.id_usuario,
                    id_rol: rolCliente.id_rol
                }, { transaction });
            }
        }

        await transaction.commit();

        const usuarioConRoles = await Usuario.findByPk(usuario.id_usuario, {
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] }
            }]
        });

        const roles = usuarioConRoles.roles?.map(r => r.nombre) || [];
        const token = generateToken(usuario.id_usuario);

        console.log(`Usuario registrado: ${usuario.nombre_completo}`);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                token,
                usuario: {
                    id: usuario.id_usuario,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    ciudad: usuario.ciudad,
                    roles: roles
                }
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error en register:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// VERIFY TOKEN
export const verifyToken = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id, {
            attributes: ['id_usuario', 'nombre_completo', 'email', 'telefono', 'ciudad', 'estado'],
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
                attributes: ['nombre']
            }]
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const roles = usuario.roles?.map(role => role.nombre) || [];

        res.json({
            success: true,
            data: {
                usuario: {
                    id: usuario.id_usuario,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    ciudad: usuario.ciudad,
                    estado: usuario.estado,
                    roles: roles
                }
            }
        });

    } catch (error) {
        console.error('Error en verifyToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// LOGOUT
export const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// RECUPERAR CONTRASEÑA - Solicitar reset
export const solicitarRecuperacion = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('Solicitud de recuperación para:', email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'El email es requerido'
            });
        }

        const usuario = await Usuario.findOne({
            where: { email: email.toLowerCase() }
        });

        if (!usuario) {
             return res.status(404).json({
                success: false,
                message: 'No existe una cuenta con este email'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);

        await usuario.update({
            reset_token: resetToken,
            reset_token_expiry: resetTokenExpiry
        });

        const resetLink = `http://192.168.0.4:5000/reset-password?token=${resetToken}`;

        console.log('Token generado para:', email);
        console.log('Enlace:', resetLink);

        // INTENTAR ENVIAR AL USUARIO PRIMERO

        let envioExitoso = false;
        let emailFalso = false;

        try {
            await enviarCorreoRecuperacion({
                emailDestino: usuario.email,
                nombre: usuario.nombre_completo,
                resetLink,
                emailOriginal: usuario.email,
                esFalso: false
            });
            console.log(' Correo enviado a:', usuario.email);
            envioExitoso = true;
        } catch (emailError) {

            // SI EL CORREO REBOTA (EMAIL NO EXISTE)

            console.log(' Error al enviar a:', usuario.email);
            console.log('Error:', emailError.message);
            
            // Verificar si es error de "usuario no existe"
            if (emailError.message?.includes('550') || 
                emailError.message?.includes('Recipient address rejected') ||
                emailError.message?.includes('User unknown') ||
                emailError.message?.includes('Invalid recipient')) {
                
                console.log(' El email NO EXISTE en la vida real');
                emailFalso = true;
                
                // Enviar al admin
                await enviarCorreoRecuperacion({
                    emailDestino: process.env.CONTACT_EMAIL || 'opticampostman@gmail.com',
                    nombre: usuario.nombre_completo,
                    resetLink,
                    emailOriginal: usuario.email,
                    esFalso: true
                });
                console.log(' Reenviado al administrador');
                envioExitoso = true;
            } else {
                // Otro tipo de error
                throw emailError;
            }
        }

        if (!envioExitoso) {
            return res.status(500).json({
                success: false,
                message: 'Error al enviar el correo de recuperación'
            });
        }

        res.json({
            success: true,
            message: emailFalso 
                ? 'El email no existe en la vida real. El enlace ha sido enviado al administrador.'
                : 'Se ha enviado un enlace de recuperación a tu correo'
        });

    } catch (error) {
        console.error('Error en solicitarRecuperacion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
};

// ============================================
// FUNCIÓN: Enviar correo de recuperación
// ============================================
const enviarCorreoRecuperacion = async ({ emailDestino, nombre, resetLink, emailOriginal, esFalso }) => {
    const transporter = createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    let subject = '🔐 Recuperación de contraseña - Óptica Balamb';
    let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #B90F0F;">🔐 Recuperación de contraseña</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Copia y pega el siguiente enlace en la app:</p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; word-break: break-all; font-family: monospace;">
                ${resetLink}
            </div>
            <p>Expira en 1 hora.</p>
        </div>
    `;

    if (esFalso) {
        subject = '⚠️ [ADMIN] Email no existe - Óptica Balamb';
        html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #B90F0F; border-radius: 8px;">
                <h2 style="color: #B90F0F;">⚠️ EL EMAIL NO EXISTE</h2>
                <p><strong>Usuario:</strong> ${nombre}</p>
                <p><strong>Email que intentó recuperar:</strong> ${emailOriginal}</p>
                <p>Enlace para restablecer:</p>
                <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; word-break: break-all; font-family: monospace;">
                    ${resetLink}
                </div>
            </div>
        `;
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Óptica Balamb" <${process.env.SMTP_USER}>`,
        to: emailDestino,
        subject: subject,
        html: html,
    });
};


// RECUPERAR CONTRASEÑA - Verificar token
export const verificarTokenRecuperacion = async (req, res) => {
    try {
        const { token } = req.params;

        console.log('Verificando token:', token);

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token requerido'
            });
        }

        const usuario = await Usuario.findOne({
            where: {
                reset_token: token,
                reset_token_expiry: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!usuario) {
            console.log('Token inválido o expirado');
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        console.log('Token válido para:', usuario.email);

        res.json({
            success: true,
            message: 'Token válido',
            data: {
                email: usuario.email,
                nombre_completo: usuario.nombre_completo
            }
        });

    } catch (error) {
        console.error('Error en verificarTokenRecuperacion:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el token'
        });
    }
};

// RECUPERAR CONTRASEÑA - Resetear contraseña (VERSIÓN DEFINITIVA)
export const resetearPassword = async (req, res) => {
    try {
        const { token, nueva_contrasena } = req.body;

        console.log('Reset de contraseña solicitado');

        if (!token || !nueva_contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Token y nueva contraseña son requeridos'
            });
        }

        if (nueva_contrasena.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        const usuario = await Usuario.findOne({
            where: {
                reset_token: token,
                reset_token_expiry: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!usuario) {
            console.log('Token inválido o expirado');
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado. Solicita un nuevo enlace.'
            });
        }

        console.log('Usuario encontrado:', usuario.email);

        // GENERAR HASH
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nueva_contrasena, salt);

        console.log('Hash generado:', hashedPassword.substring(0, 30) + '...');

        // ACTUALIZAR USANDO UPDATE DIRECTO
        await Usuario.update(
            {
                contrasena: hashedPassword,
                reset_token: null,
                reset_token_expiry: null
            },
            {
                where: { id_usuario: usuario.id_usuario }
            }
        );

        // VERIFICAR QUE SE GUARDÓ CORRECTAMENTE
        const usuarioVerificado = await Usuario.findByPk(usuario.id_usuario);
        const testMatch = await usuarioVerificado.comparePassword(nueva_contrasena);
        console.log('Prueba de login inmediata:', testMatch);

        if (!testMatch) {
            console.error('ERROR: La contraseña no se guardó correctamente');
            return res.status(500).json({
                success: false,
                message: 'Error al guardar la contraseña. Intenta nuevamente.'
            });
        }

        console.log(`Contraseña actualizada exitosamente para: ${usuario.email}`);

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.'
        });

    } catch (error) {
        console.error('Error en resetearPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error al resetear la contraseña: ' + error.message
        });
    }
};
