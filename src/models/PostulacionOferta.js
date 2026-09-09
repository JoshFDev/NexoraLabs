import { Schema, model } from "mongoose";

const postulacionOfertaEsquema = new Schema(
    {
        oferta_id: {
            type: Schema.Types.ObjectId,
            ref: "Oferta",
            required: true
        },
        usuario_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        mensaje: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        fecha: {
            type: Date,
            default: Date.now
        },
        estado: {
            type: String,
            enum: ["pendiente", "aceptada", "rechazada", "cancelada"],
            default: "pendiente"
        }
    },
    {
        versionKey: false
    }
);

export default model("PostulacionOferta", postulacionOfertaEsquema);