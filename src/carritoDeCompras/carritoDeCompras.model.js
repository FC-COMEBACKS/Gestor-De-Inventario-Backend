import { Schema, model } from "mongoose";

const CarritoDeComprasSchema = new Schema({
    idUsuario: {
        type: Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    productos: [
        {
            idProducto: {
                type: Schema.Types.ObjectId,
                ref: "Producto",  
                required: true
            },
            nombreProducto: {
                type: String,
                required: true
            },
            cantidad: {
                type: Number,
                required: true,
                default: 1
            },
            precioProducto: {
                type: Number,
                required: true
            }
        }
    ],
    cantidadTotal: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model("CarritoDeCompras", CarritoDeComprasSchema);