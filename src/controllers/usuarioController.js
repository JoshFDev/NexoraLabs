import crypto from "crypto";
import Usuario from "../models/Usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { httpStatus, badRequest, serverError, notFound, conflict } from "../shared/errors/errorHandler";
import { enviarBienvenida, enviarCodigoVerificacion, enviarCodigoEliminacion } from "../shared/mailer";
import Comentario from "../models/Comentario";
import LogroUsuario from "../models/LogroUsuario";
import MiembroEquipo from "../models/MiembroEquipo";
import Notificacion from "../models/Notificacion";
import Postulacion from "../models/Postulacion";
import PostulacionOferta from "../models/PostulacionOferta";
import Proyecto from "../models/Proyecto";
import Oferta from "../models/Oferta";
import RecursoAprendizaje from "../models/RecursoAprendizaje";
import SolicitudEquipo from "../models/SolicitudEquipo";
import UsuarioHabilidad from "../models/UsuarioHabilidad";

// Código de 6 dígitos verificado contra una firma HMAC (nunca se guarda el código en claro)
const generarCodigo = () => String(Math.floor(100000 + Math.random() * 900000));
const firmarCodigo = (codigo, email, uso) =>
    crypto.createHmac("sha256", process.env.JWT_SECRET)
        .update(`${uso}:${email.toLowerCase()}:${codigo}`)
        .digest("hex");
const codigoValido = (codigo, email, uso, firma, expira) => {
    if (!codigo || !firma || !expira || new Date(expira) < new Date()) return false;
    const esperada = Buffer.from(firmarCodigo(codigo, email, uso));
    const almacenada = Buffer.from(firma);
    return esperada.length === almacenada.length && crypto.timingSafeEqual(esperada, almacenada);
};

//GET /usuarios → listar con filtros, paginación y ordenamiento
//ej: /usuarios?buscar=josh&rol=mentor&nivel=intermedio&orden=a-z
export const listarUsuarios = async (req, res) => {
    try {
        const { buscar, rol, nivel } = req.query;
        const filtros = {};

        // Filtro por rol exacto
        if (rol) filtros.rol = rol;

        // El campo en BD se llama nivel_experiencia, mapeamos "nivel"
        if (nivel) filtros.nivel_experiencia = nivel;

        // Búsqueda de texto en nombre, apellidos o email
        if (buscar) {
            filtros.$or = [
                { nombre: { $regex: buscar, $options: "i" } },
                { apellido_paterno: { $regex: buscar, $options: "i" } },
                { apellido_materno: { $regex: buscar, $options: "i" } },
                { email: { $regex: buscar, $options: "i" } }
            ];
        }

        // ORDENAMIENTO: ?orden=recientes|antiguos|a-z|z-a
        // recientes/antiguos usan _id (fecha de creación embebida en el ObjectId)
        // a-z/z-a ordenan alfabéticamente por el nombre
        const ordenamientos = {
            recientes: { _id: -1 },
            antiguos: { _id: 1 },
            "a-z": { nombre: 1 },
            "z-a": { nombre: -1 }
        };
        const sort = ordenamientos[req.query.orden] || {};

        // PAGINACIÓN
        const pagina = Number(req.query.pagina) || 1;
        const limite = Number(req.query.limite) || 10;
        const salto = (pagina - 1) * limite;

        const total = await Usuario.countDocuments(filtros);

        // .select('-password') oculta el campo password de la respuesta
        const usuarios = await Usuario.find(filtros).sort(sort).skip(salto).limit(limite).select('-password');

        res.json({
            total,
            pagina,
            limite,
            total_paginas: Math.ceil(total / limite),
            usuarios
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /usuario/perfil → ver el perfil del usuario autenticado (el token define quién es)
export const verPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-password');
        if (!usuario) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//GET /usuario/:id → ver un usuario por id (perfil público, oculta el password)
export const obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-password');
        if (!usuario) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /usuario/registro → crear cuenta (password se guarda hasheado)
export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellido_paterno, email, password } = req.body;

        if (!nombre || !apellido_paterno || !email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Todos los campos obligatorios son requeridos (nombre, apellido_paterno, email, password)"));
        }

        if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email)) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Formato de email no válido"));
        }

        if (password.length < 8) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("La contraseña debe tener al menos 8 caracteres"));
        }

        const emailExiste = await Usuario.findOne({ email });
        if (emailExiste) {
            return res.status(httpStatus.CONFLICT).json(conflict("El email ya está registrado"));
        }

        //Hashear el password con bcrypt (nunca se guarda el texto plano)
        const salt = await bcrypt.genSalt(10);
        const passwordHasheado = await bcrypt.hash(password, salt);

        //Reemplazar el password original por el hasheado
        const usuario = new Usuario({ ...req.body, password: passwordHasheado, email_verificado: false });
        const usuarioRegistrado = await usuario.save();

        //Generar código de verificación de correo (como firma, expira en 10 min)
        const codigo = generarCodigo();
        usuarioRegistrado.codigo_verificacion = firmarCodigo(codigo, usuarioRegistrado.email, "verificacion");
        usuarioRegistrado.codigo_verificacion_expira = new Date(Date.now() + 10 * 60 * 1000);
        await usuarioRegistrado.save();

        //Correos en segundo plano (nunca rompen el registro si fallan)
        void enviarCodigoVerificacion(usuarioRegistrado, codigo);
        void enviarBienvenida(usuarioRegistrado);

        res.json({
            mensaje: "Cuenta creada. Te enviamos un código de verificación a tu correo.",
            email: usuarioRegistrado.email,
            //Solo en modo test se devuelve el código para poder completar el flujo en las pruebas
            ...(process.env.NODE_ENV === "test" ? { codigo } : {})
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /usuario/login → validar credenciales y devolver el token JWT
export const iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Email y contraseña son requeridos"));
        }

        //Buscar usuario por email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Usuario no encontrado"));
        }

        //Comparar password ingresado con el hasheado en la DB
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Contraseña incorrecta"));
        }

        //No permitir el login hasta verificar el correo (solo cuentas nuevas; las antiguas no tienen el campo)
        if (usuario.email_verificado === false) {
            return res.status(httpStatus.FORBIDDEN).json({ error: "Verifica tu correo para poder iniciar sesión", necesita_verificacion: true });
        }

        //Generar token con los datos del usuario (expira en 24h)
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /usuario/perfil → el usuario actualiza su propio perfil (solo campos de perfil)
export const actualizarMiPerfil = async (req, res) => {
    try {
        const camposPermitidos = [
            "apellido_materno",
            "telefono",
            "pais",
            "provincia",
            "acerca_de_mi",
            "nivel_experiencia",
            "especialidad_principal",
            "disponibilidad",
            "intereses",
            "idiomas",
            "educacion",
            "foto"
        ];
        const datos = {};
        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) datos[campo] = req.body[campo];
        }
        const actualizado = await Usuario.findByIdAndUpdate(req.usuario.id, { $set: datos }, { new: true }).select('-password');
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//PUT /usuario/:id → actualizar un usuario (solo admin)
export const actualizarUsuario = async (req, res) => {
    try {
        const actualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//DELETE /usuario/:id → eliminar un usuario (solo admin)
export const eliminarUsuario = async (req, res) => {
    try {
        await eliminarDatosDeUsuario(req.params.id);
        const eliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json({ message: "Usuario eliminado", usuario: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//Elimina todo el contenido relacionado con un usuario (proyectos, postulaciones, etc.)
const eliminarDatosDeUsuario = async (usuarioId) => {
    await Promise.all([
        Comentario.deleteMany({ usuario_id: usuarioId }),
        LogroUsuario.deleteMany({ usuario_id: usuarioId }),
        MiembroEquipo.deleteMany({ usuario_id: usuarioId }),
        Notificacion.deleteMany({ usuario_id: usuarioId }),
        Postulacion.deleteMany({ usuario_id: usuarioId }),
        PostulacionOferta.deleteMany({ usuario_id: usuarioId }),
        Proyecto.deleteMany({ creador_id: usuarioId }),
        Oferta.deleteMany({ publicado_por: usuarioId }),
        SolicitudEquipo.deleteMany({ usuario_id: usuarioId }),
        UsuarioHabilidad.deleteMany({ usuario_id: usuarioId }),
        //Los recursos no tienen dueño: solo se quita al usuario de recomendados y comentarios
        RecursoAprendizaje.updateMany({}, { $pull: { recomendado_por: usuarioId, comentarios: { usuario_id: usuarioId } } })
    ]);
};

//POST /usuario/verificar-email → confirmar la cuenta con el código recibido por correo
export const verificarEmail = async (req, res) => {
    try {
        const { email, codigo } = req.body;

        if (!email || !codigo) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Correo y código son requeridos"));
        }

        const usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (!usuario) {
            return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        }

        //Si ya estaba verificado se devuelve token igual (idempotente)
        if (usuario.email_verificado !== true) {
            if (!codigoValido(codigo, usuario.email, "verificacion", usuario.codigo_verificacion, usuario.codigo_verificacion_expira)) {
                return res.status(httpStatus.BAD_REQUEST).json(badRequest("Código inválido o expirado"));
            }
            usuario.email_verificado = true;
            usuario.codigo_verificacion = undefined;
            usuario.codigo_verificacion_expira = undefined;
            await usuario.save();
        }

        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            mensaje: "Correo verificado",
            token,
            usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /usuario/reenviar-codigo → reenviar el código de verificación del correo
export const reenviarCodigoVerificacion = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("El correo es requerido"));
        }

        const usuario = await Usuario.findOne({ email: email.toLowerCase() });
        if (!usuario) {
            return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        }

        if (usuario.email_verificado === true) {
            return res.json({ mensaje: "Tu correo ya está verificado" });
        }

        const codigo = generarCodigo();
        usuario.codigo_verificacion = firmarCodigo(codigo, usuario.email, "verificacion");
        usuario.codigo_verificacion_expira = new Date(Date.now() + 10 * 60 * 1000);
        await usuario.save();

        void enviarCodigoVerificacion(usuario, codigo);

        res.json({
            mensaje: "Te enviamos un código nuevo a tu correo.",
            ...(process.env.NODE_ENV === "test" ? { codigo } : {})
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /usuario/eliminar/solicitar → pedir el código para eliminar la cuenta
export const solicitarEliminarCuenta = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario) {
            return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        }

        const codigo = generarCodigo();
        usuario.codigo_eliminacion = firmarCodigo(codigo, usuario.email, "eliminacion");
        usuario.codigo_eliminacion_expira = new Date(Date.now() + 15 * 60 * 1000);
        await usuario.save();

        void enviarCodigoEliminacion(usuario, codigo);

        res.json({ mensaje: "Te enviamos un código de confirmación a tu correo." });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};

//POST /usuario/eliminar/confirmar → verificar el código y eliminar la cuenta
export const confirmarEliminarCuenta = async (req, res) => {
    try {
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("El código es requerido"));
        }

        const usuario = await Usuario.findById(req.usuario.id);
        if (!usuario) {
            return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        }

        if (!codigoValido(codigo, usuario.email, "eliminacion", usuario.codigo_eliminacion, usuario.codigo_eliminacion_expira)) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Código inválido o expirado"));
        }

        await eliminarDatosDeUsuario(usuario._id);
        await Usuario.findByIdAndDelete(usuario._id);

        res.json({ mensaje: "Tu cuenta fue eliminada. Esperamos volver a verte." });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};