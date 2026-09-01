import { Schema, model } from "mongoose";

const habilidadEsquema = new Schema(
    {
        nombre: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        categoria: {
            type: String,
            required: true,
            enum: [
                "Desarrollo Web",
                "Backend",
                "Frontend",
                "Bases de Datos",
                "Redes",
                "Ciberseguridad",
                "IoT",
                "Electrónica",
                "Inteligencia Artificial",
                "Cloud",
                "DevOps",
                "Sistemas Operativos"
            ]
        },
        descripcion: {
            type: String
        },
        nivel_minimo: {
            type: String,
            enum: ["principiante", "intermedio", "avanzado", "experto"],
            default: "principiante"
        },
        tiempo_estimado: {
            type: String
        },
        etiquetas: {
            type: [String],
            default: []
        },
        categorias_similares: {
            type: [String],
            default: []
        },
        popularidad: {
            type: Number,
            min: 0,
            default: 0
        },
        icono: {
            type: String
        },
        visible: {
            type: Boolean,
            default: true
        }
    },
    {
        versionKey: false
    }
);

export default model("Habilidad", habilidadEsquema);