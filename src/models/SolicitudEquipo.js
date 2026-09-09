import { Schema, model } from "mongoose";

const solicitudEquipoEsquema = new Schema(
    {
        equipo_id: {
            type: Schema.Types.ObjectId,
            ref: "Equipo",
            required: true,
            index: true
        },
        usuario_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true,
            index: true
        },
        estado: {
            type: String,
            enum: ["pendiente", "aprobada", "rechazada"],
            default: "pendiente"
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

export default model("SolicitudEquipo", solicitudEquipoEsquema);