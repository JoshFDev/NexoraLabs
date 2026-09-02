import { Router } from "express";
import ProyectoHabilidad from "../models/ProyectoHabilidad";

const router = Router();

//Listar todas las habilidades de los proyectos
router.get('/proyectos-habilidades', async (req, res) => {
    try {
        const proyectoHabilidades = await ProyectoHabilidad.find();
        res.json(proyectoHabilidades);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Ver una relación proyecto-habilidad por id
router.get('/proyecto-habilidad/:id', async (req, res) => {
    try {
        const proyectoHabilidad = await ProyectoHabilidad.findById(req.params.id);
        res.json(proyectoHabilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Crear relación proyecto-habilidad
router.post('/proyecto-habilidad/agregar', async (req, res) => {
    try {
        const proyectoHabilidad = new ProyectoHabilidad(req.body);
        const proyectoHabilidadRegistrada = await proyectoHabilidad.save();
        res.json(proyectoHabilidadRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Actualizar relación proyecto-habilidad
router.put('/proyecto-habilidad/:id', async (req, res) => {
    try {
        const actualizada = await ProyectoHabilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Eliminar relación proyecto-habilidad
router.delete('/proyecto-habilidad/:id', async (req, res) => {
    try {
        const eliminada = await ProyectoHabilidad.findByIdAndDelete(req.params.id);
        res.json({ message: "Relación eliminada", proyectoHabilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;