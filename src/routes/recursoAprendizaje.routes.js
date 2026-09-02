import { Router } from "express";
import RecursoAprendizaje from "../models/RecursoAprendizaje";

const router = Router();

//Listar todos los recursos de aprendizaje
router.get('/recursos-aprendizaje', async (req, res) => {
    try {
        const recursos = await RecursoAprendizaje.find();
        res.json(recursos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Ver un recurso de aprendizaje por id
router.get('/recurso-aprendizaje/:id', async (req, res) => {
    try {
        const recurso = await RecursoAprendizaje.findById(req.params.id);
        res.json(recurso);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Crear recurso de aprendizaje
router.post('/recurso-aprendizaje/agregar', async (req, res) => {
    try {
        const recurso = new RecursoAprendizaje(req.body);
        const recursoRegistrado = await recurso.save();
        res.json(recursoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Actualizar recurso de aprendizaje
router.put('/recurso-aprendizaje/:id', async (req, res) => {
    try {
        const actualizado = await RecursoAprendizaje.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Eliminar recurso de aprendizaje
router.delete('/recurso-aprendizaje/:id', async (req, res) => {
    try {
        const eliminado = await RecursoAprendizaje.findByIdAndDelete(req.params.id);
        res.json({ message: "Recurso eliminado", recurso: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;