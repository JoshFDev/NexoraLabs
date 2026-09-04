import { Router } from "express";
import RecursoAprendizaje from "../models/RecursoAprendizaje";
import { serverError, notFound, badRequest } from "../shared/errors/errorHandler";
import httpStatus from "../shared/errors/httpStatus";
import verifyToken from "../middleware/verifyToken";
import authorize from "../middleware/authorize";

const router = Router();

//Listar todos los recursos de aprendizaje (con filtros)
//GET /recursos-aprendizaje?buscar=javascript&tipo=video&nivel=intermedio
router.get('/recursos-aprendizaje', async (req, res) => {
    try {
        const { buscar, tipo, nivel } = req.query;
        const filtros = {};

        // Filtro por tipo exacto (curso/documentación/video/artículo/libro)
        if (tipo) filtros.tipo = tipo;

        // Filtro por nivel exacto
        if (nivel) filtros.nivel = nivel;

        // Búsqueda de texto en título o descripción
        if (buscar) {
            filtros.$or = [
                { titulo: { $regex: buscar, $options: "i" } },
                { descripcion: { $regex: buscar, $options: "i" } }
            ];
        }

        const recursos = await RecursoAprendizaje.find(filtros);
        res.json(recursos);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Ver un recurso de aprendizaje por id
router.get('/recurso-aprendizaje/:id', async (req, res) => {
    try {
        const recurso = await RecursoAprendizaje.findById(req.params.id);
        if (!recurso) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json(recurso);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Crear recurso de aprendizaje
router.post('/recurso-aprendizaje/agregar', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const { titulo } = req.body;
        if (!titulo) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("El campo titulo es obligatorio"));
        }
        const recurso = new RecursoAprendizaje(req.body);
        const recursoRegistrado = await recurso.save();
        res.status(httpStatus.CREATED).json(recursoRegistrado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Actualizar recurso de aprendizaje
router.put('/recurso-aprendizaje/:id', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const actualizado = await RecursoAprendizaje.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json(actualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Eliminar recurso de aprendizaje
router.delete('/recurso-aprendizaje/:id', verifyToken, authorize("admin", "mentor"), async (req, res) => {
    try {
        const eliminado = await RecursoAprendizaje.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));
        res.json({ message: "Recurso eliminado", recurso: eliminado });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

//Calificar un recurso de aprendizaje (lógica de negocio)
router.post('/recurso-aprendizaje/:id/calificar', verifyToken, async (req, res) => {
    try {
        const recursoId = req.params.id;
        const usuarioId = req.usuario.id;
        const { calificacion, texto } = req.body;

        if (!calificacion || calificacion < 1 || calificacion > 5) {
            return res.status(httpStatus.BAD_REQUEST).json(badRequest("La calificación debe ser un número entre 1 y 5"));
        }

        const recurso = await RecursoAprendizaje.findById(recursoId);
        if (!recurso) return res.status(httpStatus.NOT_FOUND).json(notFound("Recurso no encontrado"));

        const yaComento = recurso.comentarios.find(c => c.usuario_id && c.usuario_id.toString() === usuarioId);
        if (yaComento) {
            return res.status(httpStatus.CONFLICT).json(badRequest("Ya has calificado este recurso"));
        }

        recurso.comentarios.push({
            usuario_id: usuarioId,
            texto: texto || "",
            calificacion
        });

        recurso.num_valoraciones += 1;
        const total = recurso.comentarios.reduce((acc, c) => acc + c.calificacion, 0);
        recurso.valoracion_promedio = total / recurso.comentarios.length;

        const recursoActualizado = await recurso.save();
        res.status(httpStatus.CREATED).json(recursoActualizado);
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;
