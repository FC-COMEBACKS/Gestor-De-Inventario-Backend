import User from "../user/user.model.js"
import Categoria from "../categoria/categoria.model.js"
import Producto from "../productos/productos.model.js"

export const emailExists = async (email = "") => {
    const existe = await User.findOne({email})
    if(existe){
        throw new Error(`The email ${email} is already registered`)
    }
}

export const usernameExists = async (username = "") => {
    const existe = await User.findOne({username})
    if(existe){
        throw new Error(`The username ${username} is already registered`)
    }
}

export const userExists = async (uid = " ") => {
    const existe = await User.findById(uid)
    console.log(existe)
    if(!existe){
        throw new Error("No existe el usuario con el ID proporcionado")
    }
}

export const categoriaExists = async (uid = " ") => {
    const existe = await Categoria.findById(uid)
    if (!existe) {
        throw new Error("Categoria no encontrada");
    }
};

export const productoExists = async (uid = " ") => {
    const producto = await Producto.findById(uid)
    if (!producto) {
        throw new Error("Producto no encontrado");
    }
};

export const nombreProductoExists = async (nombre = " ") => {
    const producto = await Producto.findOne({ nombreProducto: nombre })
    if (!producto) {
        throw new Error("Producto no encontrado");
    }
};