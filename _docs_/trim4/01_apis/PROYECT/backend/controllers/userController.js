import { 
    Usuario, 
    Vehiculo, 
    Role, 
    RolUsuario 
} from "../models/relaciones.js";
import sequelize from "../config/database.js";
import { generateToken } from "../utils/generadorToken.js";
import { Op } from "sequelize";

// Registrar cliente
export const registrarCliente = async (req, res) => {
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
            contrasena
        } = req.body;

        // Validaciones
        if (!nombre_completo || !telefono || !fecha_nacimiento || !documento || !ciudad || !direccion || !email || !contrasena) {
            return res.status(400).json({ success: false, message: "Todos los campos son requeridos" });
        }

        // Verificar si el email ya existe
        const emailExistente = await Usuario.findOne({
            where: { email },
            transaction
        });

        if (emailExistente) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "El email ya esta registrado"
            });
        }

        // Verificar si el documento ya existe
        const documentoExistente = await Usuario.findOne({
            where: { documento },
            transaction
        });

        if (documentoExistente) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "El documento ya esta registrado"
            });
        }

        // Crear usuario
        const usuario = await Usuario.create({
            nombre_completo,
            telefono,
            fecha_nacimiento,
            documento,
            ciudad,
            direccion,
            email,
            contrasena,
            estado: 'ACTIVO'
        }, { transaction });

        // Asignar rol de CLIENTE por defecto
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

        await transaction.commit();

        // Generar token
        const token = generateToken(usuario.id_usuario);

        res.status(201).json({
            success: true,
            message: 'Cliente registrado exitosamente',
            data: {
                usuario: {
                    id: usuario.id_usuario,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    ciudad: usuario.ciudad
                },
                token
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al registrar cliente: ', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Registrar repartidor desde el panel de admin
export const registrarRepartidor = async (req, res) => {
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
            vehiculo
        } = req.body;

        // Validaciones
        if (!nombre_completo || !telefono || !fecha_nacimiento || !documento || !ciudad || !direccion || !email || !contrasena || !vehiculo) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos incluyendo el vehiculo son requeridos'
            });
        }

        // Verificar si el email ya existe
        const emailExistente = await Usuario.findOne({
            where: { email },
            transaction
        });

        if (emailExistente) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'El email ya esta registrado'
            });
        }

        // Verificar si el documento ya existe
        const documentoExistente = await Usuario.findOne({
            where: { documento },
            transaction
        });

        if (documentoExistente) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'El documento ya esta registrado'
            });
        }

        // Crear usuario
        const usuario = await Usuario.create({
            nombre_completo,
            telefono,
            fecha_nacimiento,
            documento,
            ciudad,
            direccion,
            email,
            contrasena,
            estado: 'ACTIVO'
        }, { transaction });

        // Asignar rol de repartidor
        const rolRepartidor = await Role.findOne({
            where: { nombre: 'REPARTIDOR' },
            transaction
        });

        if (rolRepartidor) {
            await RolUsuario.create({
                id_usuario: usuario.id_usuario,
                id_rol: rolRepartidor.id_rol
            }, { transaction });
        } else {
            console.log('Rol REPARTIDOR no encontrado');
            await transaction.rollback();
            return res.status(500).json({
                success: false,
                message: 'Error: Rol REPARTIDOR no encontrado en la base de datos'
            });
        }

        // Verificar si la placa ya existe
        const placaExistente = await Vehiculo.findOne({
            where: { placa: vehiculo.placa.toUpperCase() },
            transaction
        });

        if (placaExistente) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'La placa ya esta registrada'
            });
        }

        // Crear vehiculo para el repartidor
        const vehiculoCreado = await Vehiculo.create({
            id_usuario: usuario.id_usuario,
            tipo: vehiculo.tipo,
            modelo: vehiculo.modelo,
            placa: vehiculo.placa.toUpperCase(),
            color: vehiculo.color
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Repartidor registrado exitosamente',
            data: {
                usuario: {
                    id: usuario.id_usuario,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    telefono: usuario.telefono,
                    ciudad: usuario.ciudad
                },
                vehiculo: vehiculoCreado
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al registrar repartidor: ', error);
        res.status(500).json({
            success: false,
            message: 'Error interno de servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Listar repartidores
export const listarRepartidores = async (req, res) => {
    try {
        const repartidores = await Usuario.findAll({
            include: [
                {
                    model: Role,
                    as: 'roles',
                    where: { nombre: 'REPARTIDOR' },
                    through: { attributes: [] }
                },
                {
                    model: Vehiculo,
                    as: 'vehiculo',
                    attributes: { exclude: ['id_usuario'] }
                }
            ],
            attributes: { exclude: ['contrasena'] },
            order: [['nombre_completo', 'ASC']]
        });

        res.json({
            success: true,
            data: repartidores
        });

    } catch (error) {
        console.error('Error al listar repartidores:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener repartidor por ID
export const obtenerRepartidor = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['contrasena'] },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    where: { nombre: 'REPARTIDOR' },
                    through: { attributes: [] }
                },
                {
                    model: Vehiculo,
                    as: 'vehiculo',
                    attributes: { exclude: ['id_usuario'] }
                }
            ]
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Repartidor no encontrado'
            });
        }

        res.json({
            success: true,
            data: usuario
        });

    } catch (error) {
        console.error('Error al obtener repartidor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar repartidor
export const actualizarRepartidor = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            nombre_completo,
            telefono,
            fecha_nacimiento,
            documento,
            ciudad,
            direccion,
            email,
            estado,
            vehiculo
        } = req.body;

        // Verificar que el usuario existe y es repartidor
        const usuario = await Usuario.findByPk(id, {
            include: [{
                model: Role,
                as: 'roles',
                where: { nombre: 'REPARTIDOR' }
            }],
            transaction
        });

        if (!usuario) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Repartidor no encontrado'
            });
        }

        // Actualizar repartidor
        await usuario.update({
            nombre_completo: nombre_completo || usuario.nombre_completo,
            telefono: telefono || usuario.telefono,
            fecha_nacimiento: fecha_nacimiento || usuario.fecha_nacimiento,
            documento: documento || usuario.documento,
            ciudad: ciudad || usuario.ciudad,
            direccion: direccion || usuario.direccion,
            email: email || usuario.email,
            estado: estado || usuario.estado
        }, { transaction });

        // Actualizar vehiculo si se proporciona
        if (vehiculo) {
            let vehiculoExistente = await Vehiculo.findOne({
                where: { id_usuario: id },
                transaction
            });

            if (vehiculo.placa) {
                const placaExistente = await Vehiculo.findOne({
                    where: {
                        placa: vehiculo.placa.toUpperCase(),
                        id_usuario: { [Op.ne]: id }
                    },
                    transaction
                });

                if (placaExistente) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'La placa ya esta registrada por otro usuario'
                    });
                }
            }

            if (vehiculoExistente) {
                await vehiculoExistente.update({
                    tipo: vehiculo.tipo || vehiculoExistente.tipo,
                    modelo: vehiculo.modelo || vehiculoExistente.modelo,
                    placa: vehiculo.placa ? vehiculo.placa.toUpperCase() : vehiculoExistente.placa,
                    color: vehiculo.color || vehiculoExistente.color
                }, { transaction });
            } else {
                await Vehiculo.create({
                    id_usuario: id,
                    tipo: vehiculo.tipo,
                    modelo: vehiculo.modelo,
                    placa: vehiculo.placa.toUpperCase(),
                    color: vehiculo.color
                }, { transaction });
            }
        }

        await transaction.commit();

        // Obtener repartidor actualizado
        const repartidorActualizado = await Usuario.findByPk(id, {
            attributes: { exclude: ['contrasena'] },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] }
                },
                {
                    model: Vehiculo,
                    as: 'vehiculo',
                    attributes: { exclude: ['id_usuario'] }
                }
            ]
        });

        res.json({
            success: true,
            message: 'Repartidor actualizado exitosamente',
            data: repartidorActualizado
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al actualizar repartidor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Eliminar repartidor
export const eliminarRepartidor = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            include: [{
                model: Role,
                as: 'roles',
                where: { nombre: 'REPARTIDOR' }
            }]
        });

        if (!usuario) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Repartidor no encontrado'
            });
        }

        // Eliminar vehiculo asociado
        await Vehiculo.destroy({
            where: { id_usuario: id },
            transaction
        });

        // Eliminar registro en ROL_USUARIO
        await RolUsuario.destroy({
            where: { id_usuario: id },
            transaction
        });

        // Eliminar usuario
        await usuario.destroy({ transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Repartidor eliminado exitosamente'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error al eliminar repartidor: ', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Cambiar estado del repartidor
export const cambiarEstadoRepartidor = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        if (!estado || !['ACTIVO', 'INACTIVO', 'SUSPENDIDO'].includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado invalido. Debe ser: ACTIVO, INACTIVO o SUSPENDIDO'
            });
        }

        const usuario = await Usuario.findByPk(id, {
            include: [{
                model: Role,
                as: 'roles',
                where: { nombre: 'REPARTIDOR' }
            }]
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Repartidor no encontrado'
            });
        }

        await usuario.update({ estado });

        res.json({
            success: true,
            message: `Estado del repartidor actualizado a ${estado}`,
            data: {
                id: usuario.id_usuario,
                nombre_completo: usuario.nombre_completo,
                estado: usuario.estado
            }
        });

    } catch (error) {
        console.error('Error al cambiar estado del repartidor: ', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Buscar repartidores con filtros
export const buscarRepartidores = async (req, res) => {
    try {
        const { nombre, ciudad, estado, placa } = req.query;

        // Construir filtros
        const whereConditions = {};
        if (nombre) whereConditions.nombre_completo = { [Op.like]: `%${nombre}%` };
        if (ciudad) whereConditions.ciudad = { [Op.like]: `%${ciudad}%` };
        if (estado) whereConditions.estado = estado;

        const includeVehiculo = {
            model: Vehiculo,
            as: 'vehiculo',
            attributes: { exclude: ['id_usuario'] }
        };

        if (placa) {
            includeVehiculo.where = { placa: { [Op.like]: `%${placa.toUpperCase()}%` } };
        }

        const repartidores = await Usuario.findAll({
            include: [
                {
                    model: Role,
                    as: 'roles',
                    where: { nombre: 'REPARTIDOR' },
                    through: { attributes: [] }
                },
                includeVehiculo
            ],
            where: whereConditions,
            attributes: { exclude: ['contrasena'] },
            order: [['nombre_completo', 'ASC']]
        });

        res.json({
            success: true,
            data: repartidores,
            total: repartidores.length
        });

    } catch (error) {
        console.error('Error al buscar repartidores: ', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener perfil del usuario autenticado
export const obtenerPerfil = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        console.log(`Obteniendo perfil del usuario ${usuarioId}`);

        const usuario = await Usuario.findByPk(usuarioId, {
            attributes: { exclude: ['contrasena'] },
            include: [
                {
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                    attributes: ['nombre']
                }
            ]
        });

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('Perfil obtenido:', usuario.nombre_completo);

        res.json({
            success: true,
            data: {
                id_usuario: usuario.id_usuario,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
                telefono: usuario.telefono,
                direccion: usuario.direccion,
                ciudad: usuario.ciudad,
                documento: usuario.documento,
                fecha_nacimiento: usuario.fecha_nacimiento,
                estado: usuario.estado,
                roles: usuario.roles?.map(r => r.nombre) || []
            }
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Actualizar perfil del usuario autenticado
export const actualizarPerfil = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { direccion, email, telefono } = req.body;

        console.log(`📡 Actualizando perfil del usuario ${usuarioId}`);

        const usuario = await Usuario.findByPk(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el email ya existe en otro usuario
        if (email && email !== usuario.email) {
            const emailExistente = await Usuario.findOne({
                where: {
                    email: email,
                    id_usuario: { [Op.ne]: usuarioId }
                }
            });

            if (emailExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado por otro usuario'
                });
            }
        }

        // Actualizar solo los campos permitidos
        await usuario.update({
            direccion: direccion !== undefined ? direccion : usuario.direccion,
            email: email || usuario.email,
            telefono: telefono || usuario.telefono
        });

        console.log('Perfil actualizado');

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            data: {
                id_usuario: usuario.id_usuario,
                nombre_completo: usuario.nombre_completo,
                email: usuario.email,
                telefono: usuario.telefono,
                direccion: usuario.direccion
            }
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const contarClientes = async (req, res) => {
    try {
        const count = await Usuario.count({
            include: [{
                model: Role,
                as: 'roles',
                where: { nombre: 'CLIENTE' }
            }]
        });

        res.json({
            success: true,
            data: { total: count }
        });
    } catch (error) {
        console.error('Error al contar clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al contar clientes'
        });
    }
};