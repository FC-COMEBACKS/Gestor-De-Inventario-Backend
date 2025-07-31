import { hash } from "argon2";
import User from "../src/user/user.model.js"

export const adminPorDefault = async () => {
    try {
        const adminDefault = await User.findOne({ role: "ADMIN_ROLE" });

        if (!adminDefault) {
            const contraseña = await hash("Cremas30*");

            const adminData = {
                name: "Daniel Andrés",
                surname: "Tuy Tuchez",
                username: "danitt030",
                email: "danieltuy@gmail.com",
                password: contraseña,
                role: "ADMIN_ROLE",
                phone: "12345678",
            };
            await User.create(adminData);
        }
    } catch (errores) {
        console.error("Error al crear el administrador por defecto:", errores);
    }
};

