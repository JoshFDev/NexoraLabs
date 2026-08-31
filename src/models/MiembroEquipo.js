import { Schema, model } from "mongoose";

const miembroEquipoEsquema = new Schema(
    {
        equipo_id: {
            type: Schema.Types.ObjectId,
            ref: "Equipo",
            required: true
        },
        usuario_id: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },
        rol: {
            type: String
        },
        fecha_ingreso: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false
    }
);

miembroEquipoEsquema.index({ equipo_id: 1, usuario_id: 1 }, { unique: true });

export default model("MiembroEquipo", miembroEquipoEsquema);