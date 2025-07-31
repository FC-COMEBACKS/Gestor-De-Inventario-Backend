import { body, param } from "express-validator";
import { categoriaExists } from "../helpers/db-validators.js";
import { validarCampos } from "./validate-fields.js";
import { deleteFileOnError } from "./delete-file-on-error.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const createCategoriaValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    body("nombre").notEmpty().withMessage("El nombre de la categoria es requerido"),
    body("descripcion").notEmpty().withMessage("La descripcion de la categoria es requerida"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const listarCategoriasValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    validarCampos,
    deleteFileOnError,
    handleErrors
]

export const editarCategoriaValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(categoriaExists),
    body("nombre").notEmpty().withMessage("El nombre de la categoria es requerido"),
    body("descripcion").notEmpty().withMessage("La descripcion de la categoria es requerida"),
    validarCampos,
    handleErrors
]

export const eliminarCategoriaValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(categoriaExists),
    validarCampos,
    handleErrors
]