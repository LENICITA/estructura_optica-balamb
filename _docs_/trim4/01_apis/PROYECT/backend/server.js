// server.js (versión ES Modules)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import sequelize from './config/database.js';
import { Usuario, Vehiculo, Role, RolUsuario } from './models/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida');
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
});