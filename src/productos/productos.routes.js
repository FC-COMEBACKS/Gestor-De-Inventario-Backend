import { Router } from "express";
import { agregarProducto, listarProductos, listarProductoId, actualizarProducto, eliminarProducto, productosAgotados, productosMasVendidos, buscarProductosPorNombre, productosPorCategoria } from "./productos.controller.js";
import { createProductoValidator, listarProductosValidator, listarProductoPorId, actualizarProductoValidator, eliminarProductoValidator, productosAgotadosValidator, productosMasVendidosValidator, buscarProductosNombreValidator, productosPorCategoriaValidator } from "../middlewares/productos-validators.js";

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         descripcion:
 *           type: string
 *           description: Descripción detallada del producto
 *         precio:
 *           type: number
 *           format: float
 *           description: Precio del producto
 *         stock:
 *           type: integer
 *           description: Cantidad disponible en inventario
 *         stockMinimo:
 *           type: integer
 *           description: Stock mínimo antes de considerar agotado
 *         categoriaId:
 *           type: integer
 *           description: ID de la categoría del producto
 *         imagen:
 *           type: string
 *           description: URL o nombre de la imagen del producto
 *         activo:
 *           type: boolean
 *           description: Estado del producto (activo/inactivo)
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *         fechaActualizacion:
 *           type: string
 *           format: date-time
 *         categoria:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             descripcion:
 *               type: string
 *         ventasTotal:
 *           type: integer
 *           description: Total de unidades vendidas
 *     CrearProductoRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *         - stock
 *         - categoriaId
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *           description: Nombre del producto
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *           description: Descripción del producto
 *         precio:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           description: Precio del producto
 *         stock:
 *           type: integer
 *           minimum: 0
 *           description: Cantidad inicial en stock
 *         stockMinimo:
 *           type: integer
 *           minimum: 0
 *           default: 5
 *           description: Stock mínimo de alerta
 *         categoriaId:
 *           type: integer
 *           description: ID de la categoría
 *         imagen:
 *           type: string
 *           description: URL de la imagen del producto
 *         activo:
 *           type: boolean
 *           default: true
 *           description: Estado inicial del producto
 *     ActualizarProductoRequest:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 2
 *           maxLength: 200
 *         descripcion:
 *           type: string
 *           maxLength: 1000
 *         precio:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *         stock:
 *           type: integer
 *           minimum: 0
 *         stockMinimo:
 *           type: integer
 *           minimum: 0
 *         categoriaId:
 *           type: integer
 *         imagen:
 *           type: string
 *         activo:
 *           type: boolean
 *     BuscarProductosRequest:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           minLength: 1
 *           description: Nombre o parte del nombre a buscar
 *     ProductosResponse:
 *       type: object
 *       properties:
 *         productos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Producto'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 */

/**
 * @swagger
 * /productos/agregarProducto:
 *   post:
 *     summary: Agrega un nuevo producto al inventario
 *     description: Crea un nuevo producto con toda la información necesaria (solo administradores)
 *     tags:
 *       - Productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearProductoRequest'
 *           example:
 *             nombre: "Laptop Dell Inspiron"
 *             descripcion: "Laptop para uso profesional con 16GB RAM"
 *             precio: 899.99
 *             stock: 25
 *             stockMinimo: 5
 *             categoriaId: 1
 *             imagen: "laptop-dell.jpg"
 *             activo: true
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto agregado exitosamente"
 *                 producto:
 *                   $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos o producto ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden agregar productos
 *       404:
 *         description: Categoría no encontrada
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - createProductoValidator
 */
router.post("/agregarProducto", createProductoValidator, agregarProducto)

/**
 * @swagger
 * /productos/ListarProductos:
 *   get:
 *     summary: Lista todos los productos
 *     description: Obtiene una lista paginada de productos con filtros opcionales
 *     tags:
 *       - Productos
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
 *         description: Productos por página
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (true=activos, false=inactivos)
 *       - in: query
 *         name: minPrecio
 *         schema:
 *           type: number
 *           format: float
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrecio
 *         schema:
 *           type: number
 *           format: float
 *         description: Precio máximo
 *       - in: query
 *         name: ordenar
 *         schema:
 *           type: string
 *           enum: [nombre, precio, stock, fecha]
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: direccion
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Dirección del ordenamiento
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductosResponse'
 *       400:
 *         description: Parámetros de consulta inválidos
 *     security: []
 *     x-roles:
 *       - public
 *     x-validations:
 *       - listarProductosValidator
 */
router.get("/ListarProductos", listarProductosValidator, listarProductos)
 
/**
 * @swagger
 * /productos/listarProductoPorId/{id}:
 *   get:
 *     summary: Obtiene un producto específico por ID
 *     description: Retorna los detalles completos de un producto
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 1
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: ID de producto inválido
 *       404:
 *         description: Producto no encontrado
 *     security: []
 *     x-roles:
 *       - public
 *     x-validations:
 *       - listarProductoPorId
 */
router.get("/listarProductoPorId/:id", listarProductoPorId, listarProductoId)

/**
 * @swagger
 * /productos/actualizarProducto/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     description: Modifica los datos de un producto (solo administradores)
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarProductoRequest'
 *           example:
 *             nombre: "Laptop Dell Inspiron 15"
 *             precio: 949.99
 *             stock: 30
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 producto:
 *                   $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden actualizar productos
 *       404:
 *         description: Producto no encontrado
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - actualizarProductoValidator
 */
router.put("/actualizarProducto/:id", actualizarProductoValidator, actualizarProducto)

/**
 * @swagger
 * /productos/eliminarProducto/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     description: Elimina permanentemente un producto del inventario (solo administradores)
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto eliminado exitosamente"
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden eliminar productos
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: No se puede eliminar producto con ventas asociadas
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - eliminarProductoValidator
 */
router.delete("/eliminarProducto/:id", eliminarProductoValidator, eliminarProducto)

/**
 * @swagger
 * /productos/productosAgotados:
 *   get:
 *     summary: Lista productos con stock bajo o agotado
 *     description: Obtiene productos que están por debajo del stock mínimo (solo usuarios autenticados)
 *     tags:
 *       - Productos
 *       - Reportes
 *     responses:
 *       200:
 *         description: Lista de productos agotados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Token de autenticación requerido
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user
 *       - admin
 *     x-validations:
 *       - productosAgotadosValidator
 */
router.get("/productosAgotados", productosAgotadosValidator, productosAgotados)

/**
 * @swagger
 * /productos/productosMasVendidos:
 *   get:
 *     summary: Lista los productos más vendidos
 *     description: Obtiene un ranking de productos ordenados por ventas (solo usuarios autenticados)
 *     tags:
 *       - Productos
 *       - Reportes
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número de productos a retornar
 *     responses:
 *       200:
 *         description: Lista de productos más vendidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productos:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Producto'
 *                       - type: object
 *                         properties:
 *                           totalVendido:
 *                             type: integer
 *                           ingresosTotales:
 *                             type: number
 *                             format: float
 *       401:
 *         description: Token de autenticación requerido
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user
 *       - admin
 *     x-validations:
 *       - productosMasVendidosValidator
 */
router.get("/productosMasVendidos", productosMasVendidosValidator, productosMasVendidos)

/**
 * @swagger
 * /productos/buscarProductosPorNombre:
 *   post:
 *     summary: Busca productos por nombre
 *     description: Realiza una búsqueda de productos que contengan el texto especificado
 *     tags:
 *       - Productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BuscarProductosRequest'
 *           example:
 *             nombre: "laptop"
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *                 total:
 *                   type: integer
 *                 terminoBusqueda:
 *                   type: string
 *       400:
 *         description: Término de búsqueda inválido
 *     security: []
 *     x-roles:
 *       - public
 *     x-validations:
 *       - buscarProductosNombreValidator
 */
router.post("/buscarProductosPorNombre", buscarProductosNombreValidator, buscarProductosPorNombre)

/**
 * @swagger
 * /productos/productosPorCategoria/{categoriaId}:
 *   get:
 *     summary: Lista productos de una categoría específica
 *     description: Obtiene todos los productos que pertenecen a una categoría
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Solo productos activos
 *     responses:
 *       200:
 *         description: Productos de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *                 categoria:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       400:
 *         description: ID de categoría inválido
 *       404:
 *         description: Categoría no encontrada
 *     security: []
 *     x-roles:
 *       - public
 *     x-validations:
 *       - productosPorCategoriaValidator
 */
router.get("/productosPorCategoria/:categoriaId", productosPorCategoriaValidator, productosPorCategoria)

export default router