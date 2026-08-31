import { Schema, model } from "mongoose";

const equipoEsquema = new Schema(
    {
        proyecto_id: {
            type: Schema.Types.ObjectId,
            ref: "Proyecto",
            required: true,
            unique: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String
        },
        fecha_creacion: {
            type: Date,
            default: Date.now
        },
        estado: {
            type: String,
            enum: ["activo", "finalizado", "disuelto"],
            default: "activo"
        }
    },
    {
        versionKey: false
    }
);

export default model("Equipo", equipoEsquema);