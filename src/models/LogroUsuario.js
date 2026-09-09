import { Schema, model } from "mongoose";

const logroUsuarioEsquema = new Schema(
    {
        usuario_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        logro_id: {
            type: Schema.Types.ObjectId,
            ref: "Logro",
            required: true
        },
        fecha_obtencion: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false
    }
);

logroUsuarioEsquema.index({ usuario_id: 1, logro_id: 1 }, { unique: true });

export default model("LogroUsuario", logroUsuarioEsquema);