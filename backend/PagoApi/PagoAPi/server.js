// server.js
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

// Importar solo las rutas de pagos
const pagosRoutes = require('./routes/PagosRoutes');

const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// RUTAS
// ============================================
app.use('/api/pagos', pagosRoutes);

// ============================================
// RUTA DE BIENVENIDA
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Pagos de ÓptiCam funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      pagos: '/api/pagos'
    }
  });
});

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `La ruta ${req.method} ${req.url} no existe`
  });
});

// ============================================
// MANEJO DE ERRORES GLOBALES
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;