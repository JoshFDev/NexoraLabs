import { Router } from "express";
import Postulacion from "../models/Postulacion";

const router = Router();

//Listar todas las postulaciones
router.get('/postulaciones', async (req, res) => {
    try {
        const postulaciones = await Postulacion.find();
        res.json(postulaciones);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Ver una postulación por id
router.get('/postulacion/:id', async (req, res) => {
    try {
        const postulacion = await Postulacion.findById(req.params.id);
        res.json(postulacion);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Crear postulación
router.post('/postulacion/agregar', async (req, res) => {
    try {
        const postulacion = new Postulacion(req.body);
        const postulacionRegistrada = await postulacion.save();
        res.json(postulacionRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Actualizar postulación
router.put('/postulacion/:id', async (req, res) => {
    try {
        const actualizada = await Postulacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Eliminar postulación
router.delete('/postulacion/:id', async (req, res) => {
    try {
        const eliminada = await Postulacion.findByIdAndDelete(req.params.id);
        res.json({ message: "Postulación eliminada", postulacion: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;