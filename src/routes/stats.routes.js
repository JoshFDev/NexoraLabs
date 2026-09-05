import { Router } from "express";
import { obtenerStats } from "../controllers/statsController";

const router = Router();

//Estadísticas generales de la plataforma
router.get('/stats', obtenerStats);

export default router;