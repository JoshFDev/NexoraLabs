import { Router } from "express";
import UsuarioHabilidad from "../models/UsuarioHabilidad";

const router = Router();

//Listar todas las habilidades de los usuarios
router.get('/usuarios-habilidades', async (req, res) => {
    try {
        const usuarioHabilidades = await UsuarioHabilidad.find();
        res.json(usuarioHabilidades);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Ver una relación usuario-habilidad por id
router.get('/usuario-habilidad/:id', async (req, res) => {
    try {
        const usuarioHabilidad = await UsuarioHabilidad.findById(req.params.id);
        res.json(usuarioHabilidad);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Crear relación usuario-habilidad
router.post('/usuario-habilidad/agregar', async (req, res) => {
    try {
        const usuarioHabilidad = new UsuarioHabilidad(req.body);
        const usuarioHabilidadRegistrada = await usuarioHabilidad.save();
        res.json(usuarioHabilidadRegistrada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Actualizar relación usuario-habilidad
router.put('/usuario-habilidad/:id', async (req, res) => {
    try {
        const actualizada = await UsuarioHabilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizada);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

//Eliminar relación usuario-habilidad
router.delete('/usuario-habilidad/:id', async (req, res) => {
    try {
        const eliminada = await UsuarioHabilidad.findByIdAndDelete(req.params.id);
        res.json({ message: "Relación eliminada", usuarioHabilidad: eliminada });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;