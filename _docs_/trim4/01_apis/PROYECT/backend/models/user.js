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
      len: { args: [3, 100], msg: "El nombre debe ser entre 3 y 100 caracteres" }
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: "El telefono es requerido" },
      is: { args: /^[0-9+\-\s()]{7,20}$/, msg: "Teléfono inválido" }
    }
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: "La fecha de nacimiento es requerida" },
      isDate: { msg: 'Fecha invalida' }
    }
  },
  documento: {
    type: DataTypes.BIGINT(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "EL documento es requerido" },
      isInt: { msg: "Documento invalido" }
    }
  },
  ciudad: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: "La ciudad es requerida" }
    }
  },
  direccion: {
    type: DataTypes.STRING(45),
    allowNull: false,
    validate: {
      notEmpty: { msg: "La direccion es requerida" }
    }
  },
  fecha_registro: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW 
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: "El email es requerido" },
      isEmail: { msg: "Email invalido"}
    }
  },
  contrasena: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: "La contraseña es requerida" },
      len: { args: [8, 200], msg: "La contraseña debe tener al menos 8 caracteres" }
    }
  },
  estado: {
    type: DataTypes.STRING(45),
    defaultValue: 'ACTIVO',
    validate: {
      isIn: { args: [['ACTIVO', 'INACTIVO', 'SUSPENDIDO']], msg: "Estado invalido"}
    }
  }, 
}, {
  tableName: 'USUARIOS',
  timestamps: false,
  // crear el hasheo de contraseña
  hooks: {
    //cuando se crea la contraseña
    beforeCreate: async (usuario) => {
      if (usuario.contrasena) {
        const salt = await bcrypt.genSalt(10);
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
      }
    },
    // cuando se actualice la contraseña
    beforeUpdate: async (usuario) => {
      if (usuario.changed('contrasena')) {
        const salt = await bcrypt.genSalt(10);
        usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
      }
    }
  }
});

// compara las dos contraseñas de registro
Usuario.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.contrasena);  
};

// autenticacion
Usuario.authenticate = async function (email, contrasena) {
  const user = await this.findOne({ where: { email }});
  
  if (!user) {
    throw new Error("Usuario no encontrado")
  }

  const isMatch = await user.comparePassword(contrasena);

  if (!isMatch) {
    throw new Error("Contraseña incorrecta");
  }

  return user;
}

//obtener rol del usuario
Usuario.prototype.getRoles = async function() {
  const roles = await this.getRoles();
  return roles.map(role => role.nombre);
};

// Agregar este método de instancia
Usuario.prototype.comparePassword = async function(candidatePassword) {
    if (!this.contrasena) return false;
    return await bcrypt.compare(candidatePassword, this.contrasena);
};

// Método estático para autenticar
Usuario.authenticate = async function(email, contrasena) {
    const user = await this.findOne({ where: { email }});
    if (!user) throw new Error("Usuario no encontrado");
    const isMatch = await user.comparePassword(contrasena);
    if (!isMatch) throw new Error("Contraseña incorrecta");
    return user;
};

export default Usuario;