import { Router } from "express";
import { validarCorreoEndpoint } from "../controllers/correoController";

const router = Router();

//Validar si un correo existe (se usa en el registro; es público porque ocurre antes del login)
router.get("/correo/validar", validarCorreoEndpoint);

export default router;
