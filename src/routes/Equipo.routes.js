import { Router } from "express";
import Equipo from "../models/Equipo";

const router = Router();

router.get('/equipos',(req, res) => {
    res.render('index');
});

router.post('/equipo/agregar', async (req,res) => {
    try{
        const equipo = new Equipo(req.body);
        const equipoRegistrado = await equipo.save();
        console.log("Nuevo equipo registrado");
        console.log(equipoRegistrado);
        res.redirect('/equipos')
        
    } catch (error){
        console.log(error);
        res.redirect('/');
    }
});

router.get('/equipo/editar/:id', async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        res.render('editarEquipo', { equipo });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.post('/equipo/editar/:id', async (req, res) => {
    try {
        await Equipo.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/equipos');
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/equipo/eliminar/:id', async (req, res) => {
    try {
        await Equipo.findByIdAndDelete(req.params.id);
        res.redirect('/equipos');
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

export default router;