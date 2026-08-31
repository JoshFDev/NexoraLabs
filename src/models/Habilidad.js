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
        }
    },
    {
        versionKey: false
    }
);

export default model("Habilidad", habilidadEsquema);