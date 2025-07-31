import { Router } from "express";
import { getUserById, getUsers, deleteUser, updatePassword, updateUser, updateRole, eliminarCuenta } from "./user.controller.js";
import { getUserByIdValidator, getUsersValidator, deleteUserValidator, updatePasswordValidator, updateUserValidator, updateRoleValidator, confirmacionEliminarCuentaValidator } from "../middlewares/user-validators.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *         username:
 *           type: string
 *           description: Nombre de usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico
 *         role:
 *           type: string
 *           enum: [admin, user, moderator]
 *           description: Rol del usuario
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *     UpdatePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Contraseña actual
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           description: Nueva contraseña
 *     UpdateRoleRequest:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           enum: [admin, user, moderator]
 *           description: Nuevo rol para el usuario
 *     DeleteAccountRequest:
 *       type: object
 *       required:
 *         - confirmacion
 *       properties:
 *         confirmacion:
 *           type: string
 *           description: Texto de confirmación para eliminar cuenta
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users/findUser/{uid}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     description: Retorna los detalles de un usuario específico
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDetail'
 *       400:
 *         description: ID de usuario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Sin permisos para acceder a este usuario
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *       - user (solo su propio perfil)
 *     x-validations:
 *       - getUserByIdValidator
 */
router.get("/findUser/:uid", getUserByIdValidator, getUserById);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene lista de todos los usuarios
 *     description: Retorna una lista paginada de usuarios (solo admins)
 *     tags:
 *       - Users
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
 *         description: Número de usuarios por página
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDetail'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden ver todos los usuarios
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - getUsersValidator
 */
router.get("/", getUsersValidator, getUsers);

/**
 * @swagger
 * /users/deleteUser/{uid}:
 *   delete:
 *     summary: Elimina un usuario (solo admin)
 *     description: Elimina permanentemente un usuario del sistema
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *       400:
 *         description: ID de usuario inválido
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden eliminar usuarios
 *       404:
 *         description: Usuario no encontrado
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - deleteUserValidator
 */
router.delete("/deleteUser/:uid", deleteUserValidator, deleteUser);

/**
 * @swagger
 * /users/updatePassword/{uid}:
 *   patch:
 *     summary: Actualiza la contraseña de un usuario
 *     description: Permite cambiar la contraseña proporcionando la actual
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordRequest'
 *           example:
 *             currentPassword: "passwordActual123"
 *             newPassword: "nuevaPassword456"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *       400:
 *         description: Datos inválidos o contraseña actual incorrecta
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo puedes cambiar tu propia contraseña
 *       404:
 *         description: Usuario no encontrado
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user (solo su propia contraseña)
 *       - admin
 *     x-validations:
 *       - updatePasswordValidator
 */
router.patch("/updatePassword/:uid", updatePasswordValidator, updatePassword);

/**
 * @swagger
 * /users/updateUser/{uid}:
 *   put:
 *     summary: Actualiza información de un usuario
 *     description: Actualiza username y/o email de un usuario
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             username: "nuevoUsername"
 *             email: "nuevo@email.com"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserDetail'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Sin permisos para actualizar este usuario
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Username o email ya existe
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user (solo su propio perfil)
 *       - admin
 *     x-validations:
 *       - updateUserValidator
 */
router.put("/updateUser/:uid", updateUserValidator, updateUser);

/**
 * @swagger
 * /users/updateRole/{uid}:
 *   patch:
 *     summary: Actualiza el rol de un usuario (solo admin)
 *     description: Cambia el rol de un usuario específico
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *           example:
 *             role: "moderator"
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserDetail'
 *       400:
 *         description: Rol inválido
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo administradores pueden cambiar roles
 *       404:
 *         description: Usuario no encontrado
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - admin
 *     x-validations:
 *       - updateRoleValidator
 */
router.patch("/updateRole/:uid", updateRoleValidator, updateRole);

/**
 * @swagger
 * /users/eliminarCuenta/{uid}:
 *   delete:
 *     summary: Elimina la propia cuenta del usuario
 *     description: Permite al usuario eliminar su propia cuenta con confirmación
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario (debe ser el mismo que el autenticado)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteAccountRequest'
 *           example:
 *             confirmacion: "ELIMINAR MI CUENTA"
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cuenta eliminada exitosamente"
 *       400:
 *         description: Confirmación inválida o datos faltantes
 *       401:
 *         description: Token de autenticación requerido
 *       403:
 *         description: Solo puedes eliminar tu propia cuenta
 *       404:
 *         description: Usuario no encontrado
 *     security:
 *       - BearerAuth: []
 *     x-roles:
 *       - user (solo su propia cuenta)
 *     x-validations:
 *       - confirmacionEliminarCuentaValidator
 */
router.delete("/eliminarCuenta/:uid", confirmacionEliminarCuentaValidator, eliminarCuenta);

export default router;