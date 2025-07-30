import Categoria from "./categoria.model.js";
// import Producto from "../productos/productos.model.js";

export const crearCategoria = async (req, res) => {
    try {
        const data = req.body;
        const categoria = await Categoria.create(data);
        return res.status(200).json({
            message: "Categoria creada",
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
        })
    } catch (err) {
        return res.status(500).json({
            message: "Error al crear la categoria",
            error: err.message
        })
    }
}

export const listarCategorias = async (req, res) => {
    try {
        const { limite = 5, desde = 0 } = req.query;
        const query = { status: true };

        const [total, categorias] = await Promise.all([
            Categoria.countDocuments(query),
            Categoria.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        return res.status(200).json({      
            succes: true,      
            total,
            categorias
        })
    }catch(err){
        return res.status(500).json({
            message: "Error al obtener las categorias",
            error: err.message
        })
    }
}

export const editarCategoria = async (req, res) =>{
    try{
        const { uid } = req.params;
        const data = req.body;
        const categoria = await Categoria.findByIdAndUpdate(uid, data, { new: true });
        return res.status(200).json({
            message: "Categoria editada",
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
        })
    }catch(err){
        return res.status(500).json({
            message: "Error al editar la categoria",
            error: err.message
        })
    }
}

export const eliminarCategoria = async (req, res) => {
    try {
        const { uid } = req.params;

        let categoriaPorDefecto = await Categoria.findOne({ nombre: "Categoria por defecto" });
        if (!categoriaPorDefecto) {
            categoriaPorDefecto = await Categoria.create({
                nombre: "Categoria por defecto",
                descripcion: "Categoria por defecto para productos sin categoria",
            });
        }

        await Producto.updateMany({ categoria: uid }, { categoria: categoriaPorDefecto._id });

        const categoria = await Categoria.findByIdAndDelete(uid);
        if (!categoria) {
            return res.status(404).json({
                message: "Categoria no encontrada",
            });
        }

        return res.status(200).json({
            message: "Categoria eliminada",
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error al eliminar la categoria",
            error: err.message,
        });
    }
};


export const categoriaPorDefecto = async () => {
    try {
        const categoriaPorDefecto = await Categoria.findOne({ nombre: "Categoria por defecto" });

        if (!categoriaPorDefecto) {
            const catDefec = {
                nombre: "Categoria por defecto",
                descripcion: "Categoria por defecto para productos sin categoria",
            };
            await Categoria.create(catDefec);
        }
    } catch (err) {
        console.error("Error al crear la categoria por defecto:", err.message);
    }
}