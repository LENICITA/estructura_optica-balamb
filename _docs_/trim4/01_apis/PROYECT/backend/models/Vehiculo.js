import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Vehiculo = sequelize.define('Vehiculo', {
  id_vehiculo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'USUARIOS',
      key: 'id_usuario'
    }
  },
  tipo: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  placa: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  color: {
    type: DataTypes.STRING(45),
    allowNull: false
  }
}, {
  tableName: 'VEHICULOS',
  timestamps: false
});

export default Vehiculo;