// index.js
const app = require('./server');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
============================================
🚀 API de Pagos de ÓptiCam corriendo
============================================
📍 Local:   http://localhost:${PORT}
📍 Pagos:   http://localhost:${PORT}/api/pagos
============================================
✅ Base de datos conectada
✅ API lista para usar
============================================
  `);
});