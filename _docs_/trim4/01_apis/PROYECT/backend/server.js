// server.js (versión ES Modules)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import inventarioRoutes from './routes/inventarioRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import distribucionRoutes from './routes/distribucionRoutes.js';
import pagosRoutes from './routes/PagosRoutes.js';
import formulaRoutes from './routes/formulaRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import sequelize from './config/database.js';
import { Usuario, Vehiculo, Role, RolUsuario } from './models/relaciones.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '192.168.0.5';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reportes', reportRoutes);
app.use('/api/distribucion', distribucionRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/formulas', formulaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/upload', uploadRoutes);
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
        console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
});