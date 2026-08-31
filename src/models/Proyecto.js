import { Schema, model } from "mongoose";

const proyectoEsquema = new Schema(
    {
        creador_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        titulo: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            required: true
        },
        categoria: {
            type: String
        },
        nivel_dificultad: {
            type: String,
            enum: ["principiante", "intermedio", "avanzado", "experto"],
            default: "intermedio"
        },
        estado: {
            type: String,
            enum: ["borrador", "buscando_equipo", "en_desarrollo", "finalizado", "cancelado"],
            default: "borrador"
        },
        habilidades_requeridas: {
            type: [Schema.Types.ObjectId],
            ref: "Habilidad",
            default: []
        },
        integrantes_maximos: {
            type: Number,
            min: 1,
            default: 1
        },
        fecha_creacion: {
            type: Date,
            default: Date.now
        },
        fecha_limite: {
            type: Date
        }
    },
    {
        versionKey: false
    }
);

export default model("Proyecto", proyectoEsquema);