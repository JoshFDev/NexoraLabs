import { Schema, model } from "mongoose";
const usuarioEsquema = new Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        apellido_paterno: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },
        apellido_materno: {
            type: String,
            trim: true,
            maxlength: 50
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[\w.+-]+@[\w-]+\.[\w.-]+$/, "Formato de email no válido"]
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        telefono: {
            type: String,
            trim: true
        },
        pais: {
            type: String,
            trim: true
        },
        provincia: {
            type: String,
            trim: true
        },
        acerca_de_mi: {
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
        especialidad_principal: {
            type: String
        },
        disponibilidad: {
            type: String,
            enum: ["tiempo_completo", "medio_tiempo", "fines_de_semana", "bajo_demanda"],
            default: "bajo_demanda"
        },
        intereses: {
            type: [String],
            default: []
        },
        idiomas: {
            type: [String],
            default: []
        },
        educacion: {
            institucion: { type: String },
            titulo: { type: String },
            en_curso: { type: Boolean, default: false }
        },
        redes_sociales: {
            github: { type: String },
            linkedin: { type: String },
            portafolio: { type: String },
            otras: { type: [String], default: [] }
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