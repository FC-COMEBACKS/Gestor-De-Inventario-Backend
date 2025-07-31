import { Schema, model } from "mongoose";

const productosSchema = Schema({
    nombreProducto: {
        type: String,
        required: [true, "El nombre del producto es requerido"],
        maxLength: [50, "El nombre del producto no puede exceder de los 50 caracteres"]
    },
    descripcionProducto: {
        type: String,
        required: [true, "La descripción del producto es requerida"],
        maxLength: [250, "La descripción del producto no puede exceder de los 250 caracteres"]
    },
    precioProducto: {
        type: Number,
        min: [0, "El precio no puede ser cero"],
        required: [true, "El precio del producto es requerido"]
    },
    stock:{
        type: Number,
        required: true
    },
    vendidos: {
        type: Number,
        default: 0
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "Categoria",
        required: [true, "La categoria del producto es requerida"]
    },
    proveedor: {
        type: String,
        required: [true, "El proveedor del producto es requerido"],
        maxLength: [100, "El nombre del proveedor no puede exceder de los 100 caracteres"]
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    versionKey: false,
    timestamps: true
})

productosSchema.methods.toJSON = function(){
    const { _id, ...producto } = this.toObject();
    producto.uid = _id;
    return producto;
}

export default model("Producto", productosSchema)

