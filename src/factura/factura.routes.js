import { Router } from "express";
import { procesarCompra, editarFactura, anularFactura, obtenerFacturasPorUsuario, obtenerFactura, descargarFacturaPDF } from "./factura.controller.js";
import { procesarCompraValidator, editarFacturaValidator, anularFacturaValidator, obtenerFacturasPorUsuarioValidator } from "../middlewares/factura-validators.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Factura:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la factura
 *         numeroFactura:
 *           type: string
 *           description: Número único de la factura
 *         userId:
 *           type: integer
 *           description: ID del usuario que realizó la compra
 *         fechaEmision:
 *           type: string
 *           format: date-time
 *           description: Fecha de emisión de la factura
 *         estado:
 *           type: string
 *           enum: [pendiente, pagada, anulada]
 *           description: Estado actual de la factura
 *         subtotal:
 *           type: number
 *           format: float
 *           description: Subtotal sin impuestos
 *         impuestos:
 *           type: number
 *           format: float
 *           description: Monto de impuestos
 *         total:
 *           type: number
 *           format: float
 *           description: Total de la factura
 *         metodoPago:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia]
 *           description: Método de pago utilizado
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             username:
 *               type: string
 *             email:
 *               type: string
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetalleFactura'
 *     DetalleFactura:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         facturaId:
 *           type: integer
 *         productId:
 *           type: integer
 *         cantidad:
 *           type: integer
 *         precioUnitario:
 *           type: number
 *           format: float
 *         subtotal:
 *           type: number
 *           format: float
 *         producto:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             descripcion:
 *               type: string
 *     ProcesarCompraRequest:
 *       type: object
 *       required:
 *         - metodoPago
 *         - items
 *       properties:
 *         metodoPago:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia]
 *           description: Método de pago
 *         observaciones:
 *           type: string
 *           maxLength: 500
 *           description: Observaciones opcionales
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - productId
 *               - cantidad
 *             properties:
 *               productId:
 *                 type: integer
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *     EditarFacturaRequest:
 *       type: object
 *       properties:
 *         metodoPago:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia]
 *         observaciones:
 *           type: string
 *           maxLength: 500
 *         estado:
 *           type: string
 *           enum: [pendiente, pagada]
 */

/**
 * @swagger
 * /facturas/procesarCompra:
 *   post:
 *     summary: Procesa una compra y genera factura
 *     description: Convierte los productos del carrito en una factura y la procesa
 *     tags:
 *       - Facturas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcesarCompraRequest'
 *           example:
 *             metodoPago: "tarjeta"
 *             observaciones: "Entrega urgente"
 *             items:
 *               - productId: 1
 *                 cantidad: 2
 *               - productId: 3
 *                 cantidad: 1
 *     responses:
 *       201:
 *         description: Compra procesada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Compra procesada exitosamente"
 *                 factura:
 *                   $ref: '#/components/schemas/Factura'
 *       400:
 *         description: Datos inválidos o carrito vacío
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               carritoVacio:
 *                 summary: Carrito vacío
 *                 value:
 *                   error: "El carrito está vacío"
 *               stockInsuficiente:
 *                 summary: Stock insuficiente
 *                 value:
 *                   error: "Stock insuficiente para algunos productos"
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
 *       - procesarCompraValidator
 */
router.post("/procesarCompra", procesarCompraValidator, procesarCompra);

/**
 * @swagger
 * /facturas/editarFactura/{idFactura}:
 *   put:
 *     summary: Edita una factura existente
 *     description: Permite modificar datos de una factura (solo admins o dentro del período permitido)
 *     tags:
 *       - Facturas
 *     parameters:
 *       - in: path
 *         name: idFactura
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura a editar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditarFacturaRequest'
 *           example:
 *             metodoPago: "efectivo"
 *             observaciones: "Pago en efectivo al recibir"
 *             estado: "pagada"
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Factura actualizada exitosamente"
 *                 factura:
 *                   $ref: '#/components/schemas/Factura'
 *       400:
 *         description: Datos inválidos o factura no editable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Sin permisos para editar esta factura
 *       404:
 *         description: Factura no encontrada
 *       422:
 *         description: Factura no se puede editar (anulada o fuera de período)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "No se puede editar una factura anulada"
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *       - user (solo sus propias facturas dentro de 24h)
 *     x-validations:
 *       - editarFacturaValidator
 */
router.put("/editarFactura/:idFactura", editarFacturaValidator, editarFactura);

/**
 * @swagger
 * /facturas/anularFactura/{idFactura}:
 *   patch:
 *     summary: Anula una factura
 *     description: Marca una factura como anulada y revierte el stock
 *     tags:
 *       - Facturas
 *     parameters:
 *       - in: path
 *         name: idFactura
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura a anular
 *         example: 1
 *     responses:
 *       200:
 *         description: Factura anulada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Factura anulada exitosamente"
 *                 factura:
 *                   $ref: '#/components/schemas/Factura'
 *       400:
 *         description: ID de factura inválido
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Sin permisos para anular esta factura
 *       404:
 *         description: Factura no encontrada
 *       422:
 *         description: Factura ya está anulada o no se puede anular
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "La factura ya está anulada"
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *       - user (solo sus propias facturas)
 *     x-validations:
 *       - anularFacturaValidator
 */
router.patch("/anularFactura/:idFactura", anularFacturaValidator, anularFactura);

/**
 * @swagger
 * /facturas/obtenerFacturasPorUsuario:
 *   get:
 *     summary: Obtiene facturas del usuario autenticado
 *     description: Lista todas las facturas del usuario o todas si es admin
 *     tags:
 *       - Facturas
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Facturas por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, pagada, anulada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Facturas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facturas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Factura'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Token de autenticación requerido
 *       400:
 *         description: Parámetros de consulta inválidos
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user (solo sus facturas)
 *       - admin (todas las facturas)
 *     x-validations:
 *       - obtenerFacturasPorUsuarioValidator
 */
router.get("/obtenerFacturasPorUsuario", obtenerFacturasPorUsuarioValidator, obtenerFacturasPorUsuario);

/**
 * @swagger
 * /facturas/obtenerFactura/{idFactura}:
 *   get:
 *     summary: Obtiene una factura específica
 *     description: Retorna los detalles completos de una factura
 *     tags:
 *       - Facturas
 *     parameters:
 *       - in: path
 *         name: idFactura
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *         example: 1
 *     responses:
 *       200:
 *         description: Factura obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *       400:
 *         description: ID de factura inválido
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Sin permisos para ver esta factura
 *       404:
 *         description: Factura no encontrada
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user (solo sus facturas)
 *       - admin (todas las facturas)
 *     x-validations:
 *       - obtenerFacturasPorUsuarioValidator
 */
router.get("/obtenerFactura/:idFactura", obtenerFacturasPorUsuarioValidator, obtenerFactura);

/**
 * @swagger
 * /facturas/descargarPDF/{idFactura}:
 *   get:
 *     summary: Descarga factura en formato PDF
 *     description: Genera y descarga un PDF de la factura especificada
 *     tags:
 *       - Facturas
 *     parameters:
 *       - in: path
 *         name: idFactura
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la factura
 *         example: 1
 *     responses:
 *       200:
 *         description: PDF de la factura
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Nombre del archivo PDF
 *             schema:
 *               type: string
 *               example: 'attachment; filename="factura_001.pdf"'
 *       400:
 *         description: ID de factura inválido
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Sin permisos para descargar esta factura
 *       404:
 *         description: Factura no encontrada
 *       500:
 *         description: Error al generar el PDF
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user (solo sus facturas)
 *       - admin (todas las facturas)
 *     x-validations:
 *       - obtenerFacturasPorUsuarioValidator
 */
router.get("/descargarPDF/:idFactura", obtenerFacturasPorUsuarioValidator, descargarFacturaPDF);

export default router;