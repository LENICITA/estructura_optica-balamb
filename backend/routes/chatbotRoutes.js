// routes/chatbotRoutes.js
import express from "express";
import * as chatbotController from "../controllers/chatbotController.js";

const router = express.Router();

/**
 * @swagger
 * /api/chatbot/mensaje:
 *   post:
 *     summary: Enviar mensaje al chatbot
 *     tags: [ChatBot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mensaje
 *             properties:
 *               mensaje:
 *                 type: string
 *                 example: "¿Qué productos ofrecen?"
 *     responses:
 *       200:
 *         description: Respuesta del chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 mensaje_usuario:
 *                   type: string
 *                 respuesta_chatbot:
 *                   type: string
 *                 intencion:
 *                   type: string
 *                   enum: [saludo, productos, horario, envio, formulamedica, pago, devolucion, despedida, ayuda, default]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Mensaje vacio
 *       500:
 *         description: Error al procesar el mensaje
 */
router.post("/mensaje", chatbotController.enviarMensaje);

/**
 * @swagger
 * /api/chatbot/faq:
 *   get:
 *     summary: Obtener todas las preguntas frecuentes
 *     tags: [ChatBot]
 *     responses:
 *       200:
 *         description: Lista de preguntas frecuentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 faqs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       pregunta:
 *                         type: string
 *                       respuesta:
 *                         type: string
 *       500:
 *         description: Error al obtener preguntas frecuentes
 */
router.get("/faq", chatbotController.getFaqs);

/**
 * @swagger
 * /api/chatbot/faq/buscar:
 *   get:
 *     summary: Buscar preguntas frecuentes por texto
 *     tags: [ChatBot]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Termino de busqueda
 *     responses:
 *       200:
 *         description: Resultados de la busqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 query:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 resultados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       pregunta:
 *                         type: string
 *                       respuesta:
 *                         type: string
 *       400:
 *         description: Falta el termino de busqueda
 *       500:
 *         description: Error al buscar preguntas frecuentes
 */
router.get("/faq/buscar", chatbotController.searchFaqs);

export default router;