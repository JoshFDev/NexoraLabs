import { Router } from "express";
import Proyecto from "../models/Proyecto";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";

const router = Router();

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

//Ruta para listar los proyectos con filtros:
router.get('/proyectos', async (req,res) => {
    try{
        const {categoria, estado, nivel, buscar} = req.query;
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

        const proyectos = await Proyecto.find(filtros).populate('creador_id', 'nombre email')
        .populate('habilidades_requeridas', 'nombre');

        res.json(proyectos);

    }catch(error){
        console.log(error);
        res.status(500).json(serverError(error))
    }
});

export default router;
