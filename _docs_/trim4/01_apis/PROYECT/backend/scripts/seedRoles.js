import sequelize from "../config/database.js";
import Role from "../models/Role.js";

const seedRoles = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado a la base de datos');

        const roles = [
            { nombre: 'ADMIN' },
            { nombre: 'CLIENTE' },
            { nombre: 'REPARTIDOR' }
        ];

        for (const role of roles) {
            const [rol, created] = await Role.findOrCreate({
                where: { nombre: role.nombre },
                defaults: role
            });
            console.log(`Rol ${rol.nombre}: ${created ? 'Creado' : 'Ya existe'}`);
        }

        console.log('Roles iniciales creados exitosamente');
        process.exit(0);

    } catch (error) {
        console.error('Error al crear roles:', error);
        process.exit(1);
    }
};

seedRoles();