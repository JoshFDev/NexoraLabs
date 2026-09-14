import { Schema, model } from "mongoose";

const mensajeEquipoEsquema = new Schema(
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
    contenido: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
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

mensajeEquipoEsquema.index({ equipo_id: 1, fecha: 1 });

export default model("MensajeEquipo", mensajeEquipoEsquema);
