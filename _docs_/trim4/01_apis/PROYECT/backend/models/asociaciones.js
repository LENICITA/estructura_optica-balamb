import Usuario from './User.js';
import Vehiculo from './Vehiculo.js';
import Distribucion from './Distribucion.js';

// Usuario -> Distribucion
Usuario.hasMany(Distribucion, {
    foreignKey: 'id_usuario',
    as: 'distribuciones'
});

Distribucion.belongsTo(Usuario, {
    foreignKey: 'id_usuario',
    as: 'repartidor'
});

// Vehiculo -> Distribucion
Vehiculo.hasMany(Distribucion, {
    foreignKey: 'id_vehiculo',
    as: 'entregas'
});

export {
    Usuario,
    Vehiculo,
    Distribucion
};