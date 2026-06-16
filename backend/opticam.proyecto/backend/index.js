// backend/index.js

const http = require('http');
const app = require('./server');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 3000;
const host = process.env.HOST || '192.168.0.5';

app.set('port', port);

const server = http.createServer(app);

server.listen(port, host, () => {
  console.log(`
  ÓptiCam API corriendo
  http://${host}:${port}
  http://localhost:${port}
  `);
});

server.on('error', (error) => {
  if (error.syscall !== 'listen') throw error;
  
  switch (error.code) {
    case 'EACCES':
      console.error(` Puerto ${port} requiere privilegios elevados`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(` Puerto ${port} ya está en uso`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});