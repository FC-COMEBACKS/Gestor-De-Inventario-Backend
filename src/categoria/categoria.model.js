import { Schema, model} from "mongoose";

const categoriaSchema = Schema({
    nombre:{
        type: String,
        required: [true, "El nombre de categoria es requerido"],
        maxLenght: [50, "El nombre de la catgoria no puede exceder de los 50 caracteres"]
    },
    descripcion:{
        type: String,
        required: [true, "La descripcion de la categoria es requerida"],
        maxLenght: [250, "La descripcion de la categoria no puede exceder de los 250 caracteres"]
    },
    status: {
        type: Boolean,
        default: true
    }
},
{
    versionKey: false,
    timeStamps: true
})

categoriaSchema.methods.toJSON = function(){
    const {_id, ...categoria} = this.toObject()
    categoria.uid = _id
    return categoria
}

export default model("Categoria", categoriaSchema)