import { hash, verify } from "argon2";
import User from "./user.model.js";

export const getUserById = async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        return res.status(200).json({
            success: true,
            user: user.toJSON() 
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener el usuario",
            error: err.message
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const { limite = 5, desde = 0 } = req.query;
        const query = { status: true };

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        return res.status(200).json({
            success: true,
            total,
            users: users.map(user => user.toJSON()) 
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los usuarios",
            error: err.message
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        await User.findByIdAndDelete(uid);

        return res.status(200).json({
            success: true,
            message: "Usuario eliminado correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el usuario",
            error: err.message
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { uid } = req.params;
        const { newPassword } = req.body;

        const user = await User.findById(uid);

        const matchOldAndNewPassword = await verify(user.password, newPassword);

        if (matchOldAndNewPassword) {
            return res.status(400).json({
                success: false,
                message: "La nueva contraseña no puede ser igual a la anterior"
            });
        }

        const encryptedPassword = await hash(newPassword);

        await User.findByIdAndUpdate(uid, { password: encryptedPassword }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Contraseña actualizada",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar contraseña",
            error: err.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const data = req.body;

        const updatedUser = await User.findByIdAndUpdate(uid, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Usuario Actualizado',
            user: updatedUser,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar usuario',
            error: err.message
        });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { uid } = req.params;
        const { newRole } = req.body;


        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }


        if (user.role === newRole) {
            return res.status(400).json({
                success: false,
                message: "El nuevo rol no puede ser igual al actual"
            });
        }


        const validRoles = ["ADMIN_ROLE", "CLIENT_ROLE"];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: "Rol no válido"
            });
        }


        await User.findByIdAndUpdate(uid, { role: newRole }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Rol actualizado correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar rol",
            error: err.message
        });
    }
}

export const eliminarCuenta = async (req, res) => {
    try {
        const { uid } = req.params;
        const { password } = req.body;

        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        const isValidPassword = await verify(user.password, password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: "La contraseña es incorrecta"
            });
        }

        await User.findByIdAndDelete(uid);

        return res.status(200).json({
            success: true,
            message: "Cuenta eliminada correctamente"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar la cuenta",
            error: err.message
        });
    }
}