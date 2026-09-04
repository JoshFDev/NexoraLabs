import { Router } from "express";
import Proyecto from "../models/Proyecto";
import UsuarioHabilidad from "../models/UsuarioHabilidad";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";

const router = Router();

//Ruta para recomendar proyectos según las habilidades del usuario logueado:
//GET /proyecto/recomendados  (protegida: necesita token)
//OJO: debe ir ANTES de /proyecto/:id, si no "recomendados" se interpretaría como un :id
router.get('/proyecto/recomendados', verifyToken, async (req, res) => {
    try {
        // 1) Buscar las habilidades que el usuario tiene registradas en UsuarioHabilidad
        const misRegistros = await UsuarioHabilidad.find({ usuario_id: req.usuario.id });

        // Si el usuario no tiene habilidades registradas, no hay nada que recomendar
        if (misRegistros.length === 0) {
            return res.json({ total: 0, proyectos: [], mensaje: "No tienes habilidades registradas para recomendar" });
        }
        // 2) Sacar solo los ids de habilidades en un array
        const idsHabilidades = misRegistros.map(registro => registro.habilidad_id);

        // 3) Buscar proyectos que pidan ALGUNA de esas habilidades ($in)
        const proyectos = await Proyecto.find({ habilidades_requeridas: { $in: idsHabilidades } })
            .populate('creador_id', 'nombre email')
            .populate('habilidades_requeridas', 'nombre');

        // 4) Contar cuántas habilidades coinciden en cada proyecto y ordenar de mayor a menor
        const proyectosConCoincidencias = proyectos.map(proyecto => {
            // Pasamos los ObjectId a string para poder compararlos
            const idsProyecto = proyecto.habilidades_requeridas.map(h => String(h._id));
            const idsUsuario = idsHabilidades.map(id => String(id));
            const coincidencias = idsProyecto.filter(id => idsUsuario.includes(id)).length;
            return { ...proyecto.toObject(), coincidencias };
        });

        // Ordenar: los que más coinciden al inicio
        const recomendados = proyectosConCoincidencias.sort((a, b) => b.coincidencias - a.coincidencias);

        res.json({ total: recomendados.length, proyectos: recomendados });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ver un proyecto por id
router.get('/proyecto/:id', async (req, res) => {
    try {
        const proyecto = await Proyecto.findById(req.params.id)
            .populate('creador_id', 'nombre email')
            .populate('habilidades_requeridas', 'nombre');
        if (!proyecto) return res.status(httpStatus.NOT_FOUND).json(notFound("Proyecto no encontrado"));
        res.json(proyecto);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Crear proyecto
router.post('/proyecto/agregar', verifyToken, authorize("admin", "mentor", "desarrollador", "ingeniero"), async (req, res) => {
    try {
        const { creador_id, titulo, descripcion } = req.body;
        if (!creador_id || !titulo || !descripcion) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("Todos los campos obligatorios son requeridos (creador_id, titulo, descripcion)"));
        }
        const proyecto = new Proyecto(req.body);
        const proyectoRegistrado = await proyecto.save();
        res.status(httpStatus.CREATED).json(proyectoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Actualizar proyecto
router.put('/proyecto/:id', verifyToken, authorize("admin", "mentor", "desarrollador", "ingeniero"), async (req, res) => {
    try {
        const actualizado = await Proyecto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Proyecto no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Eliminar proyecto
router.delete('/proyecto/:id', verifyToken, authorize("admin", "mentor", "desarrollador", "ingeniero"), async (req, res) => {
    try {
        const eliminado = await Proyecto.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Proyecto no encontrado"));
        res.json({ message: "Proyecto eliminado", proyecto: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ruta para listar los proyectos con filtros y paginación:
//GET /proyectos?categoria=web&buscar=react&pagina=1&limite=10
router.get('/proyectos', async (req,res) => {
    try{
        const {categoria, estado, nivel, buscar} = req.query;

        // PAGINACIÓN: leemos pagina y limite del query
        // Number() los convierte a número (vienen como texto desde la URL)
        // Si vienen vacíos, usamos valores por defecto: pagina=1, limite=10
        const pagina = Number(req.query.pagina) || 1;
        const limite = Number(req.query.limite) || 10;

        // Evitamos números inválidos (negativos o cero)
        const salto = (pagina - 1) * limite;

        const filtros = {};

        if(categoria) filtros.categoria = categoria;
        if(estado) filtros.estado = estado;
        if(nivel) filtros.nivel_dificultad = nivel;

        if(buscar){
            filtros.$or =[
                {titulo: {$regex: buscar, $options: "i"}},
                {descripcion: {$regex: buscar, $options: "i"}}
            ];
        }

        // countDocuments cuenta cuántos cumplen los filtros (para el total)
        const total = await Proyecto.countDocuments(filtros);

        // .skip() se salta los de páginas anteriores, .limit() fija cuántos traer
        const proyectos = await Proyecto.find(filtros)
            .skip(salto)
            .limit(limite)
            .populate('creador_id', 'nombre email')
            .populate('habilidades_requeridas', 'nombre');

        // Devolvemos los datos + la info de paginación
        res.json({
            total,
            pagina,
            limite,
            total_paginas: Math.ceil(total / limite), // redondea hacia arriba
            proyectos
        });

    }catch(error){
        console.log(error);
        res.status(500).json(serverError(error))
    }
});

export default router;
