import { Schema, model } from "mongoose";

const notificacionEsquema = new Schema(
    {
        usuario_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true,
            index: true
        },
        tipo: {
            type: String,
            enum: ["postulacion", "equipo", "sistema"],
            default: "sistema"
        },
        titulo: {
            type: String,
            required: true,
            trim: true
        },
        mensaje: {
            type: String,
            default: ""
        },
        enlace: {
            type: String,
            default: ""
        },
        leida: {
            type: Boolean,
            default: false
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

export default model("Notificacion", notificacionEsquema);