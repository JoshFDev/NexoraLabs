import { Router } from "express";
import Equipo from "../models/Equipo";

const router = Router();

router.get('/equipos', async (req, res) => {
    try {
        const equipos = await Equipo.find();
        res.json(equipos);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.post('/equipo/agregar', async (req, res) => {
    try {
        const equipo = new Equipo(req.body);
        const equipoRegistrado = await equipo.save();
        res.json(equipoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.get('/equipo/editar/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        res.json(equipo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.post('/equipo/editar/:id', async (req, res) => {
    try {
        const actualizado = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.get('/equipo/eliminar/:id', async (req, res) => {
    try {
        const eliminado = await Equipo.findByIdAndDelete(req.params.id);
        res.json({ message: "Equipo eliminado", equipo: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.get('/equipo/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        res.json(equipo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.put('/equipo/:id', async (req, res) => {
    try {
        const actualizado = await Equipo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.delete('/equipo/:id', async (req, res) => {
    try {
        const eliminado = await Equipo.findByIdAndDelete(req.params.id);
        res.json({ message: "Equipo eliminado", equipo: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;