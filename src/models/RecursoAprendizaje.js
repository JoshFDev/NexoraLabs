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
        },
        valoracion_promedio: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        num_valoraciones: {
            type: Number,
            min: 0,
            default: 0
        },
        recomendado_por: {
            type: [Schema.Types.ObjectId],
            ref: "Usuario",
            default: []
        },
        comentarios: {
            type: [
                {
                    usuario_id: {
                        type: Schema.Types.ObjectId,
                        ref: "Usuario"
                    },
                    texto: {
                        type: String
                    },
                    calificacion: {
                        type: Number,
                        min: 1,
                        max: 5
                    },
                    fecha: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            default: []
        }
    },
    {
        versionKey: false
    }
);

export default model("RecursoAprendizaje", recursoAprendizajeEsquema);