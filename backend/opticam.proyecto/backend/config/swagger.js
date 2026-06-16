// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API ÓptiCam',
      version: '1.0.0',
      description: 'Documentación de la API de ÓptiCam - Inventario y ChatBot'
    },
    servers: [
      {
        url: 'http://192.168.0.5:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Producto: {
          type: 'object',
          properties: {
            id_producto: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            marca: { type: 'string' },
            precio: { type: 'number' },
            imagen: { type: 'string' },
            material: { type: 'string' },
            color: { type: 'string' },
            id_categoria: { type: 'integer' },
            tipo_categoria: { type: 'string' }
          }
        },
        Categoria: {
          type: 'object',
          properties: {
            id_categoria: { type: 'integer' },
            tipo_categoria: { type: 'string' },
            descripcion: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Inventario', description: 'Gestión de productos y categorías' },
      { name: 'ChatBot', description: 'Asistente virtual y preguntas frecuentes' }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;