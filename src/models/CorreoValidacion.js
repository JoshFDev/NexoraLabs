import { Schema, model } from "mongoose";

//Caché local de validaciones de correo: evita volver a llamar a la API
//de Abstract por cada tecla o usuario, cuidando el cupo del plan gratuito.
const correoValidacionEsquema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      unique: true,
      index: true
    },
    estado: {
      type: String,
      enum: ["valido", "invalido", "desechable", "riesgoso", "indeterminado"],
      required: true
    },
    deliverability: {
      type: String
    },
    detalle: {
      disposable: { type: Boolean },
      catchall: { type: Boolean },
      rol: { type: Boolean },
      brechas: { type: Number }
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

export default model("CorreoValidacion", correoValidacionEsquema);
