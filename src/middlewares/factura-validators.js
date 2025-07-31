import { body, param } from "express-validator";
import { validarCampos } from "./validate-fields.js";
import { deleteFileOnError } from "./delete-file-on-error.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const procesarCompraValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const editarFacturaValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("idFactura").isMongoId().withMessage("No es un ID válido de MongoDB"),
    body("productos").optional().notEmpty().withMessage("El campo productos debe ser un arreglo no vacío"),
    body("Cantidad").optional().notEmpty().withMessage("El campo Cantidad debe ser un número entero mayor que 0"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const anularFacturaValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("idFactura").isMongoId().withMessage("No es un ID válido de MongoDB"),
    body("motivo").optional().isString().withMessage("El motivo debe ser una cadena de texto"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const obtenerFacturasPorUsuarioValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]