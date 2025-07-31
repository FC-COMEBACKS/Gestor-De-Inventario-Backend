import { Router } from "express";
import { crearCategoria, listarCategorias, editarCategoria, eliminarCategoria } from "./categoria.controller.js";
import { createCategoriaValidator, listarCategoriasValidator, editarCategoriaValidator, eliminarCategoriaValidator  } from "../middlewares/categoria-validators.js";

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la categoría
 *         nombre:
 *           type: string
 *           description: Nombre de la categoría
 *         descripcion:
 *           type: string
 *           description: Descripción de la categoría
 *         activa:
 *           type: boolean
 *           description: Estado de la categoría (activa/inactiva)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         productosCount:
 *           type: integer
 *           description: Número de productos en esta categoría
 *     CrearCategoriaRequest:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nombre único de la categoría
 *           example: "Electrónicos"
 *         descripcion:
 *           type: string
 *           maxLength: 500
 *           description: Descripción opcional de la categoría
 *           example: "Productos electrónicos y tecnológicos"
 *         activa:
 *           type: boolean
 *           default: true
 *           description: Estado inicial de la categoría
 *     EditarCategoriaRequest:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nuevo nombre de la categoría
 *         descripcion:
 *           type: string
 *           maxLength: 500
 *           description: Nueva descripción de la categoría
 *         activa:
 *           type: boolean
 *           description: Nuevo estado de la categoría
 *     CategoriasResponse:
 *       type: object
 *       properties:
 *         categorias:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Categoria'
 *         total:
 *           type: integer
 *           description: Total de categorías
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 */

/**
 * @swagger
 * /categorias/crearCategoria:
 *   post:
 *     summary: Crea una nueva categoría
 *     description: Permite a los administradores crear una nueva categoría de productos
 *     tags:
 *       - Categorías
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearCategoriaRequest'
 *           example:
 *             nombre: "Electrónicos"
 *             descripcion: "Productos electrónicos y tecnológicos"
 *             activa: true
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoría creada exitosamente"
 *                 categoria:
 *                   $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Datos inválidos o categoría ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               datosInvalidos:
 *                 summary: Datos inválidos
 *                 value:
 *                   error: "Datos inválidos"
 *                   details: ["El nombre es requerido", "El nombre debe tener al menos 2 caracteres"]
 *               categoriaExiste:
 *                 summary: Categoría ya existe
 *                 value:
 *                   error: "La categoría ya existe"
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden crear categorías
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Acceso denegado. Se requieren permisos de administrador"
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - createCategoriaValidator
 */
router.post("/crearCategoria", createCategoriaValidator, crearCategoria)

/**
 * @swagger
 * /categorias/listarCategorias:
 *   get:
 *     summary: Lista todas las categorías
 *     description: Obtiene una lista paginada de todas las categorías (acceso público)
 *     tags:
 *       - Categorías
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
 *           maximum: 100
 *           default: 10
 *         description: Número de categorías por página
 *       - in: query
 *         name: activa
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (true=activas, false=inactivas)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre de categoría
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriasResponse'
 *             example:
 *               categorias:
 *                 - id: 1
 *                   nombre: "Electrónicos"
 *                   descripcion: "Productos electrónicos"
 *                   activa: true
 *                   productosCount: 25
 *                   createdAt: "2024-01-01T00:00:00Z"
 *               total: 1
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 1
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *     security: []
 *     x-roles:
 *       - public
 *     x-validations:
 *       - listarCategoriasValidator
 */
router.get("/listarCategorias", listarCategoriasValidator, listarCategorias)

/**
 * @swagger
 * /categorias/editarCategoria/{uid}:
 *   put:
 *     summary: Edita una categoría existente
 *     description: Permite a los administradores modificar los datos de una categoría
 *     tags:
 *       - Categorías
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la categoría a editar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditarCategoriaRequest'
 *           example:
 *             nombre: "Electrónicos y Tecnología"
 *             descripcion: "Productos electrónicos, tecnológicos y gadgets"
 *             activa: true
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoría actualizada exitosamente"
 *                 categoria:
 *                   $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Datos inválidos o ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden editar categorías
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Categoría no encontrada"
 *       409:
 *         description: Conflicto - nombre de categoría ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Ya existe una categoría con ese nombre"
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - editarCategoriaValidator
 */
router.put("/editarCategoria/:uid", editarCategoriaValidator, editarCategoria)

/**
 * @swagger
 * /categorias/eliminarCategoria/{uid}:
 *   delete:
 *     summary: Elimina una categoría
 *     description: Permite a los administradores eliminar una categoría (solo si no tiene productos asociados)
 *     tags:
 *       - Categorías
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la categoría a eliminar
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoría eliminada exitosamente"
 *       400:
 *         description: ID de categoría inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden eliminar categorías
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Categoría no encontrada"
 *       409:
 *         description: No se puede eliminar - categoría tiene productos asociados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "No se puede eliminar la categoría porque tiene productos asociados"
 *       500:
 *         description: Error interno del servidor
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - eliminarCategoriaValidator
 */
router.delete("/eliminarCategoria/:uid", eliminarCategoriaValidator, eliminarCategoria)

export default router