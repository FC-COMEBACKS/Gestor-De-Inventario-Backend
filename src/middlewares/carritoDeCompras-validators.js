import { body, param } from "express-validator";
import { validarCampos } from "./validate-fields.js";
import { deleteFileOnError } from "./delete-file-on-error.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const agregarProductoAlCarritoValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    body("idProducto").isMongoId().withMessage("No es un ID válido de MongoDB"),
    body("cantidad").isInt({ min: 1 }).withMessage("La cantidad debe ser un número entero mayor a 0"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const listarProductoCarritoValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const eliminarProductoDelCarritoValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    param("idProducto").isMongoId().withMessage("No es un ID válido de MongoDB"),
    validarCampos,
    handleErrors
]
