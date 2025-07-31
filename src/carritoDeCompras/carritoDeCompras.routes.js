import { Router } from "express";
import { agregarProductoCarrito, listarProductosCarrito, eliminarProductoCarrito} from "./CarritoDeCompras.controller.js";
import { agregarProductoAlCarritoValidator, listarProductoCarritoValidator, eliminarProductoDelCarritoValidator } from "../middlewares/carritoDeCompras-validators.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CarritoItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del item en el carrito
 *         productId:
 *           type: integer
 *           description: ID del producto
 *         userId:
 *           type: integer
 *           description: ID del usuario propietario del carrito
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *           description: Cantidad del producto en el carrito
 *         precio:
 *           type: number
 *           format: float
 *           description: Precio unitario del producto
 *         subtotal:
 *           type: number
 *           format: float
 *           description: Subtotal (precio * cantidad)
 *         producto:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             descripcion:
 *               type: string
 *             precio:
 *               type: number
 *               format: float
 *             stock:
 *               type: integer
 *             imagen:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AgregarProductoRequest:
 *       type: object
 *       required:
 *         - productId
 *         - cantidad
 *       properties:
 *         productId:
 *           type: integer
 *           description: ID del producto a agregar
 *           example: 1
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: Cantidad del producto
 *           example: 2
 *     EliminarProductoRequest:
 *       type: object
 *       required:
 *         - productId
 *       properties:
 *         productId:
 *           type: integer
 *           description: ID del producto a eliminar del carrito
 *           example: 1
 *     CarritoResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CarritoItem'
 *         total:
 *           type: number
 *           format: float
 *           description: Total general del carrito
 *         cantidadItems:
 *           type: integer
 *           description: Cantidad total de items en el carrito
 */

/**
 * @swagger
 * /carrito/agregarProducto:
 *   post:
 *     summary: Agrega un producto al carrito de compras
 *     description: Añade un producto con la cantidad especificada al carrito del usuario autenticado
 *     tags:
 *       - Carrito de Compras
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgregarProductoRequest'
 *           example:
 *             productId: 1
 *             cantidad: 2
 *     responses:
 *       201:
 *         description: Producto agregado al carrito exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto agregado al carrito exitosamente"
 *                 item:
 *                   $ref: '#/components/schemas/CarritoItem'
 *       200:
 *         description: Cantidad del producto actualizada en el carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cantidad actualizada en el carrito"
 *                 item:
 *                   $ref: '#/components/schemas/CarritoItem'
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               datosInvalidos:
 *                 summary: Datos inválidos
 *                 value:
 *                   error: "Datos inválidos"
 *                   details: ["productId es requerido", "cantidad debe ser mayor a 0"]
 *               stockInsuficiente:
 *                 summary: Stock insuficiente
 *                 value:
 *                   error: "Stock insuficiente"
 *                   details: ["Solo quedan 5 unidades disponibles"]
 *       401:
 *         description: Token de autenticación requerido
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Producto no encontrado"
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user
 *       - admin
 *     x-validations:
 *       - agregarProductoAlCarritoValidator
 */
router.post("/agregarProducto", agregarProductoAlCarritoValidator, agregarProductoCarrito);

/**
 * @swagger
 * /carrito/listarCarrito:
 *   get:
 *     summary: Lista todos los productos en el carrito
 *     description: Obtiene todos los productos del carrito del usuario autenticado con detalles y total
 *     tags:
 *       - Carrito de Compras
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarritoResponse'
 *             example:
 *               items:
 *                 - id: 1
 *                   productId: 1
 *                   userId: 1
 *                   cantidad: 2
 *                   precio: 25.99
 *                   subtotal: 51.98
 *                   producto:
 *                     id: 1
 *                     nombre: "Producto ejemplo"
 *                     descripcion: "Descripción del producto"
 *                     precio: 25.99
 *                     stock: 10
 *                     imagen: "imagen.jpg"
 *               total: 51.98
 *               cantidadItems: 1
 *       200:
 *         description: Carrito vacío
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El carrito está vacío"
 *                 items:
 *                   type: array
 *                   items: {}
 *                   example: []
 *                 total:
 *                   type: number
 *                   example: 0
 *                 cantidadItems:
 *                   type: integer
 *                   example: 0
 *       401:
 *         description: Token de autenticación requerido
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user
 *       - admin
 *     x-validations:
 *       - listarProductoCarritoValidator
 */
router.get("/listarCarrito", listarProductoCarritoValidator, listarProductosCarrito);

/**
 * @swagger
 * /carrito/eliminarProducto:
 *   delete:
 *     summary: Elimina un producto del carrito
 *     description: Remueve completamente un producto específico del carrito del usuario
 *     tags:
 *       - Carrito de Compras
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EliminarProductoRequest'
 *           example:
 *             productId: 1
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto eliminado del carrito exitosamente"
 *                 carritoActualizado:
 *                   $ref: '#/components/schemas/CarritoResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Datos inválidos"
 *               details: ["productId es requerido"]
 *       401:
 *         description: Token de autenticación requerido
 *       404:
 *         description: Producto no encontrado en el carrito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Producto no encontrado en el carrito"
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user
 *       - admin
 *     x-validations:
 *       - eliminarProductoDelCarritoValidator
 */
router.delete("/eliminarProducto", eliminarProductoDelCarritoValidator, eliminarProductoCarrito);

export default router;