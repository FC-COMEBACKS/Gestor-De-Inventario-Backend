import { Router } from "express";
import { getUserById, getUsers, deleteUser, updatePassword, updateUser, updateRole, eliminarCuenta } from "./user.controller.js";
import { getUserByIdValidator, getUsersValidator, deleteUserValidator, updatePasswordValidator, updateUserValidator, updateRoleValidator, confirmacionEliminarCuentaValidator } from "../middlewares/user-validators.js";

const router = Router();

router.get("/findUser/:uid", getUserByIdValidator, getUserById);

router.get("/", getUsersValidator, getUsers);

router.delete("/deleteUser/:uid", deleteUserValidator, deleteUser);

router.patch("/updatePassword/:uid", updatePasswordValidator, updatePassword);

router.put("/updateUser/:uid", updateUserValidator, updateUser);

router.patch("/updateRole/:uid", updateRoleValidator, updateRole);

router.delete("/eliminarCuenta/:uid", confirmacionEliminarCuentaValidator, eliminarCuenta);

export default router;
