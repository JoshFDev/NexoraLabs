import { Router } from "express";
import Usuario from "../models/Usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken";

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

//Ruta protegida - solo usuarios autenticados
router.get('/usuario/perfil', verifyToken, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario.id).select('-password');
        res.json(usuario);
    } catch (error) {
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

//Registro de usuario (con password hasheado):
router.post('/usuario/registro', async (req,res) =>{
    try{
        const { password } = req.body;

        //Hashear el password con bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHasheado = await bcrypt.hash(password, salt);

        //Reemplazar el password original por el hasheado
        const usuario = new Usuario({ ...req.body, password: passwordHasheado });
        const usuarioRegistrado = await usuario.save();

        //No devolver el password en la respuesta
        const { password: _, ...usuarioSinPassword } = usuarioRegistrado.toObject();
        res.json(usuarioSinPassword);
    }catch (error){
        console.log(error);
        res.status(500).json({error});
    }
});

//Login de usuario:
router.post('/usuario/login', async (req, res) => {
    try{
        const { email, password } = req.body;

        //Buscar usuario por email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        //Comparar password ingresado con el hasheado en la DB
        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        //Generar token con los datos del usuario
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
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