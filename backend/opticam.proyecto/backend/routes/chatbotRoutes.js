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
 *                   enum: [saludo, productos, horario, envio, formulamedica, pago, devolucion, despedida, ayuda, default, precios, contacto, garantia]
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
 * /api/chatbot/botones:
 *   get:
 *     summary: Obtener botones rápidos disponibles
 *     tags: [ChatBot]
 *     responses:
 *       200:
 *         description: Lista de botones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 botones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       label:
 *                         type: string
 *                       value:
 *                         type: string
 *       500:
 *         description: Error al obtener botones
 */
router.get("/botones", chatbotController.getBotones);

export default router;