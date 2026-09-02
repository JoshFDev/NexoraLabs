import { Router } from "express";
import Proyecto from "../models/Proyecto";

const router = Router();

//Listar todos los proyectos
router.get('/proyectos', async (req, res) => {
    try {
        const proyectos = await Proyecto.find();
        res.json(proyectos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Ver un proyecto por id
router.get('/proyecto/:id', async (req, res) => {
    try {
        const proyecto = await Proyecto.findById(req.params.id);
        res.json(proyecto);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Crear proyecto
router.post('/proyecto/agregar', async (req, res) => {
    try {
        const proyecto = new Proyecto(req.body);
        const proyectoRegistrado = await proyecto.save();
        res.json(proyectoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Actualizar proyecto
router.put('/proyecto/:id', async (req, res) => {
    try {
        const actualizado = await Proyecto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Eliminar proyecto
router.delete('/proyecto/:id', async (req, res) => {
    try {
        const eliminado = await Proyecto.findByIdAndDelete(req.params.id);
        res.json({ message: "Proyecto eliminado", proyecto: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;