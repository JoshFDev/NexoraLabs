import { Router } from "express";
import ProyectoHabilidad from "../models/ProyectoHabilidad";
import { serverError, notFound } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";

const router = Router();

//Listar todas las habilidades de los proyectos
router.get('/proyectos-habilidades', async (req, res) => {
    try {
        const proyectoHabilidades = await ProyectoHabilidad.find()
            .populate('proyecto_id', 'titulo')
            .populate('habilidad_id', 'nombre');
        res.json(proyectoHabilidades);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ver una relación proyecto-habilidad por id
router.get('/proyecto-habilidad/:id', async (req, res) => {
    try {
        const proyectoHabilidad = await ProyectoHabilidad.findById(req.params.id)
            .populate('proyecto_id', 'titulo')
            .populate('habilidad_id', 'nombre');
        if (!proyectoHabilidad) return res.status(httpStatus.NOT_FOUND).json(notFound("Relación proyecto-habilidad no encontrada"));
        res.json(proyectoHabilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Crear relación proyecto-habilidad
router.post('/proyecto-habilidad/agregar', async (req, res) => {
    try {
        const proyectoHabilidad = new ProyectoHabilidad(req.body);
        const proyectoHabilidadRegistrada = await proyectoHabilidad.save();
        res.status(httpStatus.CREATED).json(proyectoHabilidadRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Actualizar relación proyecto-habilidad
router.put('/proyecto-habilidad/:id', async (req, res) => {
    try {
        const actualizada = await ProyectoHabilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(httpStatus.NOT_FOUND).json(notFound("Relación proyecto-habilidad no encontrada"));
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Eliminar relación proyecto-habilidad
router.delete('/proyecto-habilidad/:id', async (req, res) => {
    try {
        const eliminada = await ProyectoHabilidad.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(httpStatus.NOT_FOUND).json(notFound("Relación proyecto-habilidad no encontrada"));
        res.json({ message: "Relación eliminada", proyectoHabilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
