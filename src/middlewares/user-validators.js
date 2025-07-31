import { body, param } from "express-validator";
import { emailExists, usernameExists, userExists } from "../helpers/db-validators.js";
import { validarCampos } from "./validate-fields.js";
import { deleteFileOnError } from "./delete-file-on-error.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./validate-roles.js";

export const registerValidator = [
    body("name").notEmpty().withMessage("El nombre es requerido"),
    body("username").notEmpty().withMessage("El username es requerido"),
    body("email").notEmpty().withMessage("El email es requerido"),
    body("email").isEmail().withMessage("No es un email válido"),
    body("email").custom(emailExists),
    body("username").custom(usernameExists),
    body("password").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
    validarCampos,
    deleteFileOnError,
    handleErrors
];

export const loginValidator = [
    body("email").optional().isEmail().withMessage("No es un email válido"),
    body("username").optional().isString().withMessage("Username es en formáto erróneo"),
    body("password").isLength({ min: 2 }).withMessage("El password debe contener al menos 2 caracteres"),
    validarCampos,
    handleErrors
];

export const getUserByIdValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(userExists),
    validarCampos,
    handleErrors
];

export const deleteUserValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(userExists),
    validarCampos,
    handleErrors
];

export const updatePasswordValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(userExists),
    body("newPassword").isLength({ min: 4 }).withMessage("El password debe contener al menos 8 caracteres"),
    validarCampos,
    handleErrors
];

export const updateUserValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    param("uid", "No es un ID válido").isMongoId(),
    param("uid").custom(userExists),
    validarCampos,
    handleErrors
];

export const updateRoleValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(userExists),
    body("newRole").isString().withMessage("El rol debe ser una cadena de texto").isIn(["ADMIN_ROLE", "CLIENT_ROLE"]).withMessage("Rol no válido"),
    validarCampos,
    handleErrors
];


export const getUsersValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    validarCampos,
    handleErrors
];

export const confirmacionEliminarCuentaValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "CLIENT_ROLE"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
    validarCampos,
    handleErrors
]
