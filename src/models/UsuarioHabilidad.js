import { Schema, model } from "mongoose";

const usuarioHabilidadEsquema = new Schema(
    {
        usuario_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        habilidad_id: {
            type: Schema.Types.ObjectId,
            ref: "Habilidad",
            required: true
        },
        nivel: {
            type: String,
            enum: ["principiante", "intermedio", "avanzado", "experto"],
            default: "principiante"
        },
        años_experiencia: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    {
        versionKey: false
    }
);

usuarioHabilidadEsquema.index({ usuario_id: 1, habilidad_id: 1 }, { unique: true });

export default model("UsuarioHabilidad", usuarioHabilidadEsquema);