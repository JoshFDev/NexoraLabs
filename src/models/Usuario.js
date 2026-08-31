import { Schema, model } from "mongoose";

const usuarioEsquema = new Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        apellido: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        descripcion: {
            type: String
        },
        rol: {
            type: String,
            required: true,
            enum: ["estudiante", "desarrollador", "ingeniero", "mentor"],
            default: "estudiante"
        },
        nivel_experiencia: {
            type: String,
            enum: ["principiante", "intermedio", "avanzado", "experto"],
            default: "principiante"
        },
        intereses: {
            type: [String],
            default: []
        },
        foto: {
            type: String
        },
        fecha_registro: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false
    }
);

export default model("Usuario", usuarioEsquema);