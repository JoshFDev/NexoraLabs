import { Router } from "express";
import MiembroEquipo from "../models/MiembroEquipo";

const router = Router();

router.get('/miembros-equipo', async (req, res) => {
    try {
        const miembros = await MiembroEquipo.find();
        res.json(miembros);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.get('/miembro-equipo/:id', async (req, res) => {
    try {
        const miembro = await MiembroEquipo.findById(req.params.id);
        res.json(miembro);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.post('/miembro-equipo/agregar', async (req, res) => {
    try {
        const miembro = new MiembroEquipo(req.body);
        const miembroRegistrado = await miembro.save();
        res.json(miembroRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.put('/miembro-equipo/:id', async (req, res) => {
    try {
        const actualizado = await MiembroEquipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.delete('/miembro-equipo/:id', async (req, res) => {
    try {
        const eliminado = await MiembroEquipo.findByIdAndDelete(req.params.id);
        res.json({ message: "Miembro eliminado", miembro: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;