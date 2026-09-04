import { Router } from "express";
import rateLimit from "express-rate-limit";
import Usuario from "../models/Usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import { httpStatus, badRequest, unauthorized, serverError, notFound } from "../shared/errors/errorHandler";

const router = Router();

//Listar todos los usuarios (con filtros)
//GET /usuarios?buscar=josh&rol=mentor&nivel=intermedio
router.get('/usuarios', async (req,res) => {
    try{
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

        // PAGINACIÓN
        const pagina = Number(req.query.pagina) || 1;
        const limite = Number(req.query.limite) || 10;
        const salto = (pagina - 1) * limite;

        const total = await Usuario.countDocuments(filtros);

        // .select('-password') oculta el campo password de la respuesta
        const usuarios = await Usuario.find(filtros).skip(salto).limit(limite).select('-password');

        res.json({
            total,
            pagina,
            limite,
            total_paginas: Math.ceil(total / limite),
            usuarios
        });
    } catch (error){
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ruta protegida - solo usuarios autenticados
router.get('/usuario/perfil', verifyToken, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-password');
        if (!usuario) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Busqueda de usuario por id
router.get('/usuario/:id', async (req,res) => {
    try{
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json(usuario);
    }catch(error){
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Registro de usuario (con password hasheado):
router.post('/usuario/registro', async (req,res) =>{
    try{
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
            return res.status(httpStatus.CONFLICT).json(badRequest("El email ya está registrado"));
        }

        //Hashear el password con bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHasheado = await bcrypt.hash(password, salt);

        //Reemplazar el password original por el hasheado
        const usuario = new Usuario({ ...req.body, password: passwordHasheado });
        const usuarioRegistrado = await usuario.save();

        //No devolver el password en la respuesta
        const { password: _, ...usuarioSinPassword } = usuarioRegistrado.toObject();
        res.json(usuarioSinPassword);
    }catch (error){
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Limitador ESTRICTO solo para el login (anti fuerza bruta):
//10 intentos por IP cada 15 minutos; al superarlos responde 429
const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de 15 minutos
    limit: 10,                // solo 10 intentos por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados intentos de login, espera 15 minutos" }
});

//Login de usuario:
router.post('/usuario/login', limitadorLogin, async (req, res) => {
    try{
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

        //Generar token con los datos del usuario
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
    }catch (error){
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Actualizar usuaurio 
router.put('/usuario/:id', verifyToken, authorize("admin"), async (req,res) => {
    try{
        const actualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json(actualizado);
    }catch(error){
        console.log(error);
        res.status(500).json(serverError(error));
    }
});


//Eliminar usuario:
router.delete('/usuario/:id', verifyToken, authorize("admin"), async(req,res) => {
    try{
        const eliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Usuario no encontrado"));
        res.json({message: "Usuario eliminado", usuario: eliminado});
    }catch(error){
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;