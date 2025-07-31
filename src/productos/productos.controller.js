import Producto from "./productos.model.js";
import Categoria from "../categoria/categoria.model.js";

export const agregarProducto = async (req, res) => {
    try{
        const dato = req.body;
        const producto = await Producto.create(dato);
        res.status(200).json({
            message: "El producto se ha agregado correctamente",
            producto
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al agregar el producto",
            error: err.message
        })
    }
}

export const listarProductos = async (req, res) => {
    try {
        const productos = await Producto.find({ status: true }).populate("categoria", "nombre");
        return res.status(200).json({
            success: true,
            productos
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los productos",
            error: err.message
        });
    }
};

export const listarProductoId = async (req, res) => {
    try{
        const { id} = req.params;
        const producto = await Producto.findById(id).populate("categoria", "nombre");
        if(!producto || !producto.status){
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            })
        }
        return res.status(200).json({
            success: true,
            producto
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al obtener el producto",
            error: err.message
        })
    }
}

export const actualizarProducto = async (req, res) => {
    try{
        const { id } = req.params
        const { nombreProducto, descripcionProducto, precioProducto, categoria, stock, proveedor } = req.body;

        const categoriaExistente = await Categoria.findById(categoria);
        if(!categoriaExistente){
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            })
        }

        const producto = await Producto.findByIdAndUpdate(id, { nombreProducto, descripcionProducto, precioProducto, categoria, stock, proveedor }, { new: true });
        if(!producto){
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Producto actualizado correctamente",
            producto
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al actualizar el producto",
            error: err.message
        })
    }
}

export const eliminarProducto = async (req, res) => {
    try{
        const { id } = req.params;
        const producto = await Producto.findByIdAndUpdate(id, { status: false }, { new: true });
        if(!producto){
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Producto eliminado correctamente"
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el producto",
            error: err.message
        })
    }
}

export const productosAgotados = async (req, res) => {
    try {
        const productos = await Producto.find({ stock: 0, status: true });
        return res.status(200).json({
            success: true,
            productos
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al obtener los productos agotados",
            error: err.message
        });
    }
}

// ADMIN
export const productosMasVendidos = async (req, res) => {
    try {
        const productos = await Producto.find({ status: true }).sort({ vendidos: -1 }).limit(10);
        return res.status(200).json({
            success: true,
            productos
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al obtener los productos más vendidos",
            error: err.message
        });
    }
}

// ADMIN Y USUARIO
export const productosPorCategoria = async (req, res) => {
    try {
        const { categoriaId } = req.params;
        const categoria = await Categoria.findById(categoriaId);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: "Categoría no encontrada"
            });
        }
        const productos = await Producto.find({ categoria: categoriaId, status: true }).populate("categoria", "nombre");
        return res.status(200).json({
            success: true,
            productos
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener los productos por categoría",
            error: err.message
        });
    }
};


// ADMIN Y USUARIO
export const buscarProductosPorNombre = async (req, res) => {
    try {
        const { nombreProducto } = req.body; 

        if (!nombreProducto) {
            return res.status(400).json({
                success: false,
                message: "El nombre del producto es requerido"
            });
        }

        const productos = await Producto.find({
            nombreProducto: new RegExp(nombreProducto, 'i'),
            status: true
        }).select('nombreProducto descripcionProducto precioProducto stock proveedor');

        if (productos.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado"
            });
        }

        return res.status(200).json({
            success: true,
            productos
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar el producto',
            error: error.message
        });
    }
};
