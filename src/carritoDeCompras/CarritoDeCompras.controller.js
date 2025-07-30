import CarritoDeCompras from './carritoDeCompras.model.js';
import Producto from '../productos/productos.model.js';

export const agregarProductoCarrito = async (req, res) => {
    try {
        const { idProducto, cantidad } = req.body;
        const usuario = req.usuario; 

        const producto = await Producto.findById(idProducto);
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }

        if (producto.stock < cantidad) {
            return res.status(400).json({
                success: false,
                message: "No hay suficiente stock para este producto"
            });
        }

        let carrito = await CarritoDeCompras.findOne({ idUsuario: usuario._id });
        if (!carrito) {
            carrito = new CarritoDeCompras({
                idUsuario: usuario._id,
                productos: [],
                cantidadTotal: 0
            });
        }

        const productoEnCarrito = carrito.productos.find(p => p.idProducto.toString() === idProducto);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad += cantidad;
        } else {
            carrito.productos.push({ 
                idProducto, 
                nombreProducto: producto.nombreProducto,
                cantidad, 
                precioProducto: producto.precioProducto 
            });
        }

        carrito.cantidadTotal += producto.precioProducto * cantidad;

        await carrito.save();

        return res.status(200).json({
            success: true,
            message: "Producto agregado al carrito de compras",
            carrito
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al agregar el producto al carrito de compras",
            error: err.message
        });
    }
}

export const listarProductosCarrito = async (req, res) => {
    try {
        const { usuario } = req;

        const carrito = await CarritoDeCompras.findOne({ idUsuario: usuario._id }).populate("productos.idProducto");

        if (!carrito) {
            return res.status(404).json({
                success: false,
                message: "Carrito de compras no encontrado"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Productos en el carrito de compras",
            productos: carrito.productos,
            cantidadTotal: carrito.cantidadTotal
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al listar los productos en el carrito de compras",
            error: err.message
        });
    }
}

export const eliminarProductoCarrito = async (req, res) => {
    try {
        const { idProducto } = req.params;
        const { usuario } = req;

        const carrito = await CarritoDeCompras.findOne({ idUsuario: usuario._id });

        if (!carrito) {
            return res.status(404).json({
                success: false,
                message: "Carrito no encontrado"
            });
        }

        const productoIndex = carrito.productos.findIndex(p => p.idProducto.toString() === idProducto);

        if (productoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado en el carrito"
            });
        }

        carrito.cantidadTotal -= carrito.productos[productoIndex].precioProducto * carrito.productos[productoIndex].cantidad;

        carrito.productos.splice(productoIndex, 1);

        await carrito.save();

        return res.status(200).json({
            success: true,
            message: "Producto eliminado del carrito de compras",
            carrito
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el producto del carrito de compras",
            error: err.message
        });
    }
};
