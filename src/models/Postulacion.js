import { Schema, model } from "mongoose";

const postulacionEsquema = new Schema(
    {
        proyecto_id: {
            type: Schema.Types.ObjectId,
            ref: "Proyecto",
            required: true
        },
        usuario_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        mensaje: {
            type: String
        },
        habilidades_ofrecidas: {
            type: [Schema.Types.ObjectId],
            ref: "Habilidad",
            default: []
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

export default model("Postulacion", postulacionEsquema);