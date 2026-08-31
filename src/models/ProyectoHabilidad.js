import { Schema, model } from "mongoose";

const proyectoHabilidadEsquema = new Schema(
    {
        proyecto_id: {
            type: Schema.Types.ObjectId,
            ref: "Proyecto",
            required: true
        },
        habilidad_id: {
            type: Schema.Types.ObjectId,
            ref: "Habilidad",
            required: true
        },
        nivel_requerido: {
            type: String,
            enum: ["principiante", "intermedio", "avanzado", "experto"],
            default: "intermedio"
        },
        obligatoria: {
            type: Boolean,
            default: true
        }
    },
    {
        versionKey: false
    }
);

proyectoHabilidadEsquema.index({ proyecto_id: 1, habilidad_id: 1 }, { unique: true });

export default model("ProyectoHabilidad", proyectoHabilidadEsquema);