import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

// tabla de USUARIOS en BD
const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_completo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: "EL nombre completo es requerido" },
      notNull:  { msg: "El nombre completo es requerido" },
      len: { args: [3, 100], msg: "El nombre debe ser entre 3 y 100 caracteres" }
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: "El telefono es requerido" },
      notNull: { msg: "El telefono es requerido" },
      is: {
        args: /^3\d{9}$/,
        msg: "El teléfono debe empezar por 3 y tener 10 dígitos"
      }
    }
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: "La fecha de nacimiento es requerida" },
      notNull:  { msg: "La fecha de nacimiento es requerida" },
      isDate:   { msg: "La fecha de nacimiento no es válida" }
    }
  },
  documento: {
    type: DataTypes.BIGINT(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "EL documento es requerido" },
      notNull:  { msg: "El documento es requerido" },
      isInt:    { msg: "El documento debe contener solo números" }
    }
  },
  ciudad: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: "La ciudad es requerida" },
      notNull:  { msg: "La ciudad es requerida" },
      is: {
        args: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
        msg: "La ciudad solo puede contener letras y espacios"
      }
    }
  },
  direccion: {
    type: DataTypes.STRING(45),
    allowNull: false,
    validate: {
      notEmpty: { msg: "La direccion es requerida" },
      notNull: { msg: "La dirección es requerida" }
    }
  },
  fecha_registro: {
    type: DataTypes.DATE,    
    defaultValue: DataTypes.NOW
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "El email es requerido" },
      notNull:  { msg: "El email es requerido" },
      isEmail: { msg: "El email no tiene un formato válido"}
    }
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: "La contraseña es requerida" },
      notNull:  { msg: "La contraseña es requerida" },
      len: { args: [8, 255], msg: "La contraseña debe tener al menos 8 caracteres" }
    }
  },
  estado: {
    type: DataTypes.STRING(45),
    defaultValue: 'ACTIVO',
    validate: {
      isIn: { args: [['ACTIVO', 'INACTIVO', 'SUSPENDIDO']], msg: "Estado invalido"}
    }
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'USUARIOS',
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.contrasena) {
        const salt = await bcrypt.genSalt(10);
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('contrasena')) {
        const contrasena = usuario.getDataValue('contrasena');
        // Solo hashear si NO es un hash de bcrypt
        if (!contrasena.startsWith('$2a$') && !contrasena.startsWith('$2b$') && !contrasena.startsWith('$2y$')) {
          const salt = await bcrypt.genSalt(10);
          usuario.contrasena = await bcrypt.hash(contrasena, salt);
        }
      }
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.comparePassword = async function (candidatePassword) {
  if (!this.contrasena) return false;
  return await bcrypt.compare(candidatePassword, this.contrasena);  
};

// Método estático para autenticar
Usuario.authenticate = async function (email, contrasena) {
  const user = await this.findOne({ where: { email }});
  if (!user) throw new Error("Usuario no encontrado");
  const isMatch = await user.comparePassword(contrasena);
  if (!isMatch) throw new Error("Contraseña incorrecta");
  return user;
};

export default Usuario;