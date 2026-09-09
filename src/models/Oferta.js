import { Schema, model } from "mongoose";

const ofertaEsquema = new Schema(
    {
        titulo: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        empresa: {
            type: String,
            trim: true,
            maxlength: 100
        },
        descripcion: {
            type: String,
            required: true,
            trim: true
        },
        tipo: {
            type: String,
            enum: ["empleo", "practica", "voluntariado"],
            default: "empleo"
        },
        modalidad: {
            type: String,
            enum: ["remoto", "hibrido", "presencial"],
            default: "remoto"
        },
        ubicacion: {
            type: String,
            trim: true,
            maxlength: 100
        },
        salario: {
            type: String,
            trim: true,
            maxlength: 100
        },
        nivel: {
            type: String,
            enum: ["principiante", "intermedio", "avanzado", "experto"],
            default: "intermedio"
        },
        habilidades_requeridas: {
            type: [Schema.Types.ObjectId],
            ref: "Habilidad",
            default: []
        },
        estado: {
            type: String,
            enum: ["abierta", "cerrada", "cancelada"],
            default: "abierta"
        },
        fecha_limite: {
            type: Date
        },
        fecha_publicacion: {
            type: Date,
            default: Date.now
        },
        publicado_por: {
            type: Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        }
    },
    {
        versionKey: false
    }
);

export default model("Oferta", ofertaEsquema);