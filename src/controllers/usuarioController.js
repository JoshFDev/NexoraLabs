import Usuario from "../models/Usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { httpStatus, badRequest, serverError, notFound, conflict } from "../shared/errors/errorHandler";

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

//GET /usuario/:id → ver un usuario por id
export const obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
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
        const usuario = new Usuario({ ...req.body, password: passwordHasheado });
        const usuarioRegistrado = await usuario.save();

        //No devolver el password en la respuesta
        const { password: _, ...usuarioSinPassword } = usuarioRegistrado.toObject();
        res.json(usuarioSinPassword);
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
        const eliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json({ message: "Usuario eliminado", usuario: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
};