import { Schema, model } from "mongoose";

const logroEsquema = new Schema(
    {
        clave: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            trim: true
        },
        icono: {
            type: String,
            default: "★"
        },
        tipo: {
            type: String,
            enum: [
                "crear_proyecto",
                "completar_perfil",
                "postularse",
                "unirse_equipo",
                "comentar",
                "calificar_recurso"
            ],
            required: true
        },
        cantidad: {
            type: Number,
            min: 1,
            default: 1
        },
        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        versionKey: false
    }
);

export default model("Logro", logroEsquema);