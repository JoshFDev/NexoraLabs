import { Schema, model } from "mongoose";

const comentarioEsquema = new Schema(
    {
        proyecto_id: {
            type: Schema.Types.ObjectId,
            ref: "Proyecto",
            required: true,
            index: true
        },
        usuario_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        contenido: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false
    }
);

export default model("Comentario", comentarioEsquema);