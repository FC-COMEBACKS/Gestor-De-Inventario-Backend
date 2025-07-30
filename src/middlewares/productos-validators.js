import { body, param } from "express-validator";
import { productoExists, categoriaExists } from "../helpers/db-validators.js";
import { validarCampos } from "./validate-fields.js";
import { deleteFileOnError } from "./delete-file-on-error.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const createProductoValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    body("nombreProducto").notEmpty().withMessage("El nombre del producto es requerido"),
    body("descripcionProducto").notEmpty().withMessage("La descripción del producto es requerida"),
    body("precioProducto").notEmpty().withMessage("El precio del producto es requerido"),
    body("stock").notEmpty().withMessage("El stock del producto es requerido"),
    body("categoria").notEmpty().withMessage("La categoria del producto es requerida").custom(categoriaExists),
    body("proveedor").notEmpty().withMessage("El proveedor del producto es requerido"),
    body("categoria").custom(categoriaExists),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const listarProductosValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const listarProductoPorId = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    param("id").notEmpty().withMessage("El id del producto es requerido").custom(productoExists),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const actualizarProductoValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    body("nombreProducto").notEmpty().withMessage("El nombre del producto es requerido"),
    body("descripcionProducto").notEmpty().withMessage("La descripción del producto es requerida"),
    body("precioProducto").notEmpty().withMessage("El precio del producto es requerido"),
    body("categoria").notEmpty().withMessage("La categoria del producto es requerida").custom(categoriaExists),
    body("proveedor").notEmpty().withMessage("El proveedor del producto es requerido"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const eliminarProductoValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("id").notEmpty().withMessage("El id del producto es requerido"),
    param("id").custom(productoExists),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const productosAgotadosValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"), 
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const productosMasVendidosValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const buscarProductosNombreValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const productosPorCategoriaValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    param("categoriaId").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("categoriaId").custom(categoriaExists),
    validarCampos,
    deleteFileOnError,
    handleErrors
]
