import { Router } from "express";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";
import { obtenerStats, statsAdmin } from "../controllers/statsController";

const router = Router();

//Estadísticas generales de la plataforma (público)
router.get('/stats', obtenerStats);

//Métricas ampliadas (solo admin)
router.get('/admin/stats', verifyToken, authorize("admin"), statsAdmin);

export default router;