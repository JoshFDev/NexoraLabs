import { Router } from "express";
import Usuario from "../models/Usuario";

const router = Router();

//Listar todos los usuarios:
router.get('/usuarios', async (req,res) => {
    try{
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error){
        console.log(error);
        res.status(500).json({ error });
    }
});

//Busqueda de usuario por id
router.get('/usuario/:id', async (req,res) => {
    try{
        const usuario = await Usuario.findById(req.params.id);
        res.json(usuario);
    }catch(error){
        console.log(error);
        res.status(500).json({error});
    }
});

//Hacer post de un usuario:
router.post('/usuario/registro',async (req,res) =>{
    try{
        const usuario = new Usuario(req.body);
        const usuarioRegistrado = await usuario.save();
        res.json(usuarioRegistrado);
    }catch (error){
        console.log(error);
        res.status(500).json({error});
    }
});

//Actualizar usuaurio 
router.put('/usuario/:id',async (req,res) => {
    try{
        const actualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(actualizado);
    }catch(error){
        console.log(error);
        res.status(500).json({error});
    }
});


//Eliminar usuario:
router.delete('/usuario/:id', async(req,res) => {
    try{
        const eliminado = await Usuario.findByIdAndDelete(req.params.id);
        res.json({message: "Usuario eliminado", usuario: eliminado});
    }catch(error){
        console.log(error);
        res.status(500).json({error});
    }
});

export default router;
