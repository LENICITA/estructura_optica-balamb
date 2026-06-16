// server.js
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Importar rutas
//const usuariosRoutes = require('./routes/usuariosRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
//const pedidosRoutes = require('./routes/pedidosRoutes');
//const pagosRoutes = require('./routes/pagosRoutes');
//const distribucionRoutes = require('./routes/distribucionRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
//const reportesRoutes = require('./routes/reportesRoutes');

const app = express();

// ========== CONFIGURACIÓN CORS ==========
app.use(cors({
  origin: [
    'http://192.168.0.5',
    'http://localhost',
    'http://127.0.0.1'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Manejar preflight CORS
app.options('*', cors());

// ========== MIDDLEWARES GLOBALES ==========
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ========== RUTAS DE ÓPTICAM ==========
//app.use('/api/usuarios', usuariosRoutes);
app.use('/api/inventario', inventarioRoutes);
//app.use('/api/pedidos', pedidosRoutes);
//app.use('/api/pagos', pagosRoutes);
//app.use('/api/distribucion', distribucionRoutes);
app.use('/api/chatbot', chatbotRoutes);
//app.use('/api/reportes', reportesRoutes);

// ========== ENDPOINTS DE PRUEBA ==========
app.get('/', (req, res) => {
  res.json({
    message: 'API de ÓptiCam funcionando',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      inventario: 'http://localhost:3000/api/inventario',
      chatbot: 'http://localhost:3000/api/chatbot'
    }
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'ÓptiCam API test exitoso',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== MANEJO DE ERRORES ==========

// Error 404 - Ruta no encontrada
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.method} ${req.url} no existe en ÓptiCam API`
  });
});

// Error 500 - Error general del servidor
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

module.exports = app;