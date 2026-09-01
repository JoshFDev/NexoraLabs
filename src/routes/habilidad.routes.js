import { Router } from "express";
import Habilidad from "../models/Habilidad";

const router = Router();

//Listar todas las habilidades
router.get('/habilidades', async (req, res) => {
    try {
        const habilidades = await Habilidad.find();
        res.json(habilidades);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Ver una habilidad por id
router.get('/habilidad/:id', async (req, res) => {
    try {
        const habilidad = await Habilidad.findById(req.params.id);
        res.json(habilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Crear habilidad
router.post('/habilidad/agregar', async (req, res) => {
    try {
        const habilidad = new Habilidad(req.body);
        const habilidadRegistrada = await habilidad.save();
        res.json(habilidadRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Actualizar habilidad
router.put('/habilidad/:id', async (req, res) => {
    try {
        const actualizada = await Habilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Eliminar habilidad
router.delete('/habilidad/:id', async (req, res) => {
    try {
        const eliminada = await Habilidad.findByIdAndDelete(req.params.id);
        res.json({ message: "Habilidad eliminada", habilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;