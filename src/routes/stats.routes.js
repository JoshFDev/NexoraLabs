import { Router } from "express";
import Usuario from "../models/Usuario";
import Proyecto from "../models/Proyecto";
import Equipo from "../models/Equipo";
import Postulacion from "../models/Postulacion";
import Habilidad from "../models/Habilidad";
import RecursoAprendizaje from "../models/RecursoAprendizaje";
import { serverError } from "../shared/errors/errorHandler";

const router = Router();

//Estadísticas generales de la plataforma:
//GET /stats
router.get('/stats', async (req, res) => {
    try {
        //Promise.all ejecuta todas las consultas en paralelo (se ahorra tiempo de espera)
        const [totalUsuarios, totalProyectos, totalEquipos, totalPostulaciones, totalHabilidades, totalRecursos] = await Promise.all([
            Usuario.countDocuments(),
            Proyecto.countDocuments(),
            Equipo.countDocuments(),
            Postulacion.countDocuments(),
            Habilidad.countDocuments(),
            RecursoAprendizaje.countDocuments()
        ]);

        //Agrupaciones con aggregate: contar cuántos hay por cada valor de un campo
        //$group agrupa, $sum: 1 suma 1 por cada documento, $sort ordena desc por cantidad
        const [usuariosPorRol, proyectosPorEstado, postulacionesPorEstado, equiposPorEstado] = await Promise.all([
            Usuario.aggregate([{ $group: { _id: "$rol", cantidad: { $sum: 1 } } }, { $sort: { cantidad: -1 } }]),
            Proyecto.aggregate([{ $group: { _id: "$estado", cantidad: { $sum: 1 } } }, { $sort: { cantidad: -1 } }]),
            Postulacion.aggregate([{ $group: { _id: "$estado", cantidad: { $sum: 1 } } }, { $sort: { cantidad: -1 } }]),
            Equipo.aggregate([{ $group: { _id: "$estado", cantidad: { $sum: 1 } } }, { $sort: { cantidad: -1 } }])
        ]);

        //Top habilidades más pedidas en proyectos:
        //$unwind desarma el array habilidades_requeridas en un documento por cada habilidad
        //$lookup une con la colección "habilidades" para traer el nombre
        const habilidadesMasPedidas = await Proyecto.aggregate([
            { $unwind: "$habilidades_requeridas" },
            { $group: { _id: "$habilidades_requeridas", cantidad: { $sum: 1 } } },
            { $sort: { cantidad: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "habilidades",
                    localField: "_id",
                    foreignField: "_id",
                    as: "habilidad"
                }
            },
            { $unwind: "$habilidad" },
            { $project: { _id: 1, nombre: "$habilidad.nombre", cantidad: 1 } }
        ]);

        res.json({
            total_usuarios: totalUsuarios,
            usuarios_por_rol: usuariosPorRol,
            total_proyectos: totalProyectos,
            proyectos_por_estado: proyectosPorEstado,
            total_equipos: totalEquipos,
            equipos_por_estado: equiposPorEstado,
            total_postulaciones: totalPostulaciones,
            postulaciones_por_estado: postulacionesPorEstado,
            total_habilidades: totalHabilidades,
            total_recursos_aprendizaje: totalRecursos,
            habilidades_mas_pedidas: habilidadesMasPedidas
        });
    } catch (error) {
        console.log(error);
        res.status(500).json(serverError(error));
    }
});

export default router;