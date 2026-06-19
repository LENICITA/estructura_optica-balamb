// scripts/createAdmin.js
import sequelize from '../config/database.js';
import Usuario from '../models/User.js';
import Role from '../models/Role.js';
import RolUsuario from '../models/RolUsuario.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conectado a la base de datos');

    const adminData = {
      nombre_completo: process.env.ADMIN_NOMBRE || 'Administrador Sistema',
      telefono: process.env.ADMIN_TELEFONO || '3113578562',
      fecha_nacimiento: process.env.ADMIN_FECHA_NACIMIENTO || '1990-01-01',
      documento: process.env.ADMIN_DOCUMENTO || 123456789,
      ciudad: process.env.ADMIN_CIUDAD || 'Bogotá',
      direccion: process.env.ADMIN_DIRECCION || 'Calle Principal #123',
      email: process.env.ADMIN_EMAIL || 'admin@opticam.com',
      contrasena: process.env.ADMIN_CONTRASENA || 'Admin123!',
      estado: 'ACTIVO'
    };

    // Verificar si ya existe un admin
    const adminExistente = await Usuario.findOne({
      where: { email: adminData.email },
      transaction
    });

    if (adminExistente) {
      console.log('El administrador ya existe, actualizando contraseña...');
      
      // Hashear la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const contrasenaHash = await bcrypt.hash(adminData.contrasena, salt);
      
      // Actualizar el admin existente
      await adminExistente.update({
        contrasena: contrasenaHash,
        estado: 'ACTIVO',
        nombre_completo: adminData.nombre_completo,
        telefono: adminData.telefono,
        fecha_nacimiento: adminData.fecha_nacimiento,
        documento: adminData.documento,
        ciudad: adminData.ciudad,
        direccion: adminData.direccion
      }, { transaction });
      
      console.log('Contraseña actualizada correctamente');
      
      // Verificar que funciona
      const isMatch = await bcrypt.compare(adminData.contrasena, contrasenaHash);
      console.log('¿Contraseña coincide?', isMatch ? 'Sí' : 'No');
      
      await transaction.commit();
      
      console.log('\n ¡Admin actualizado! Prueba el login:');
      console.log('Email:', adminData.email);
      console.log('Contraseña:', adminData.contrasena);
      
      process.exit(0);
    }

    // Si no existe, crear nuevo admin
    console.log('Creando nuevo administrador...');
    
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(adminData.contrasena, salt);

    // Crear usuario admin
    const admin = await Usuario.create({
      nombre_completo: adminData.nombre_completo,
      telefono: adminData.telefono,
      fecha_nacimiento: adminData.fecha_nacimiento,
      documento: adminData.documento,
      ciudad: adminData.ciudad,
      direccion: adminData.direccion,
      email: adminData.email,
      contrasena: contrasenaHash,
      estado: adminData.estado
    }, { 
      transaction,
      validate: false
    });

    // Buscar el rol ADMIN
    let rolAdmin = await Role.findOne({
      where: { nombre: 'ADMIN' },
      transaction
    });

    // Si no existe el rol, crearlo
    if (!rolAdmin) {
      rolAdmin = await Role.create({
        nombre: 'ADMIN'
      }, { transaction });
      console.log('Rol ADMIN creado');
    }

    // Asignar rol ADMIN al usuario
    await RolUsuario.create({
      id_rol: rolAdmin.id_rol,
      id_usuario: admin.id_usuario
    }, { transaction });

    await transaction.commit();

    console.log('Administrador creado exitosamente');
    console.log('Email:', adminData.email);
    console.log('Contraseña:', adminData.contrasena);
    console.log('Por favor, cambia la contraseña en el primer inicio de sesión');

    process.exit(0);

  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear administrador:', error);
    console.error('Detalles:', error.message);
    process.exit(1);
  }
};

createAdmin();