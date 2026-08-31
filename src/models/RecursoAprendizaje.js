import { Schema, model } from "mongoose";

const recursoAprendizajeEsquema = new Schema(
    {
        titulo: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String
        },
        url: {
            type: String
        },
        tipo: {
            type: String,
            enum: ["curso", "documentación", "video", "artículo", "libro"],
            default: "curso"
        },
        nivel: {
            type: String,
            enum: ["principiante", "intermedio", "avanzado", "experto"],
            default: "principiante"
        },
        habilidad_id: {
            type: Schema.Types.ObjectId,
            ref: "Habilidad"
        }
    },
    {
        versionKey: false
    }
);

export default model("RecursoAprendizaje", recursoAprendizajeEsquema);