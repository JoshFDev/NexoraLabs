import { Router } from "express";

const router = Router();

const rutas = [
    { metodo: "POST", ruta: "/usuario/registro", descripcion: "Registrar nuevo usuario" },
    { metodo: "POST", ruta: "/usuario/login", descripcion: "Iniciar sesión y obtener token" },
    { metodo: "GET", ruta: "/usuario/perfil", descripcion: "Ver perfil propio (requiere token)" },
    { metodo: "GET", ruta: "/usuarios", descripcion: "Listar usuarios" },
    { metodo: "GET", ruta: "/usuario/:id", descripcion: "Ver usuario por id" },
    { metodo: "PUT", ruta: "/usuario/:id", descripcion: "Actualizar usuario (admin)" },
    { metodo: "DELETE", ruta: "/usuario/:id", descripcion: "Eliminar usuario (admin)" },

    { metodo: "GET", ruta: "/proyectos", descripcion: "Listar proyectos" },
    { metodo: "GET", ruta: "/proyecto/:id", descripcion: "Ver proyecto por id" },
    { metodo: "POST", ruta: "/proyecto/agregar", descripcion: "Crear proyecto (colaborador)" },
    { metodo: "PUT", ruta: "/proyecto/:id", descripcion: "Actualizar proyecto" },
    { metodo: "DELETE", ruta: "/proyecto/:id", descripcion: "Eliminar proyecto" },

    { metodo: "GET", ruta: "/equipos", descripcion: "Listar equipos" },
    { metodo: "GET", ruta: "/equipo/:id", descripcion: "Ver equipo por id" },
    { metodo: "POST", ruta: "/equipo/agregar", descripcion: "Crear equipo (admin/mentor)" },
    { metodo: "PUT", ruta: "/equipo/:id", descripcion: "Actualizar equipo" },
    { metodo: "DELETE", ruta: "/equipo/:id", descripcion: "Eliminar equipo" },

    { metodo: "GET", ruta: "/habilidades", descripcion: "Listar habilidades" },
    { metodo: "GET", ruta: "/habilidad/:id", descripcion: "Ver habilidad por id" },
    { metodo: "POST", ruta: "/habilidad/agregar", descripcion: "Crear habilidad (admin/mentor)" },
    { metodo: "PUT", ruta: "/habilidad/:id", descripcion: "Actualizar habilidad" },
    { metodo: "DELETE", ruta: "/habilidad/:id", descripcion: "Eliminar habilidad" },

    { metodo: "GET", ruta: "/postulaciones", descripcion: "Listar postulaciones" },
    { metodo: "GET", ruta: "/postulacion/:id", descripcion: "Ver postulación por id" },
    { metodo: "POST", ruta: "/postulacion/agregar", descripcion: "Crear postulación" },
    { metodo: "PUT", ruta: "/postulacion/:id", descripcion: "Actualizar postulación (admin)" },
    { metodo: "DELETE", ruta: "/postulacion/:id", descripcion: "Eliminar postulación (admin)" },
    { metodo: "PUT", ruta: "/postulacion-own/:id", descripcion: "Editar mi postulación pendiente (autenticado)" },
    { metodo: "DELETE", ruta: "/postulacion-own/:id", descripcion: "Retirar/cancelar mi postulación (autenticado)" },

    { metodo: "GET", ruta: "/recursos-aprendizaje", descripcion: "Listar recursos de aprendizaje" },
    { metodo: "GET", ruta: "/recurso-aprendizaje/:id", descripcion: "Ver recurso por id" },
    { metodo: "POST", ruta: "/recurso-aprendizaje/agregar", descripcion: "Crear recurso (admin/mentor)" },
    { metodo: "PUT", ruta: "/recurso-aprendizaje/:id", descripcion: "Actualizar recurso" },
    { metodo: "DELETE", ruta: "/recurso-aprendizaje/:id", descripcion: "Eliminar recurso" },

    { metodo: "GET", ruta: "/miembros-equipo", descripcion: "Listar miembros de equipo" },
    { metodo: "GET", ruta: "/miembro-equipo/:id", descripcion: "Ver miembro por id" },
    { metodo: "POST", ruta: "/miembro-equipo/agregar", descripcion: "Agregar miembro (admin/mentor)" },
    { metodo: "PUT", ruta: "/miembro-equipo/:id", descripcion: "Actualizar miembro" },
    { metodo: "DELETE", ruta: "/miembro-equipo/:id", descripcion: "Eliminar miembro" },

    { metodo: "GET", ruta: "/usuarios-habilidades", descripcion: "Listar habilidades de usuarios" },
    { metodo: "GET", ruta: "/usuario-habilidad/:id", descripcion: "Ver relación usuario-habilidad" },
    { metodo: "POST", ruta: "/usuario-habilidad/agregar", descripcion: "Crear relación usuario-habilidad" },
    { metodo: "PUT", ruta: "/usuario-habilidad/:id", descripcion: "Actualizar relación usuario-habilidad" },
    { metodo: "DELETE", ruta: "/usuario-habilidad/:id", descripcion: "Eliminar relación (admin)" },

    { metodo: "GET", ruta: "/proyectos-habilidades", descripcion: "Listar habilidades de proyectos" },
    { metodo: "GET", ruta: "/proyecto-habilidad/:id", descripcion: "Ver relación proyecto-habilidad" },
    { metodo: "POST", ruta: "/proyecto-habilidad/agregar", descripcion: "Crear relación proyecto-habilidad (admin/mentor)" },
    { metodo: "PUT", ruta: "/proyecto-habilidad/:id", descripcion: "Actualizar relación proyecto-habilidad" },
    { metodo: "DELETE", ruta: "/proyecto-habilidad/:id", descripcion: "Eliminar relación proyecto-habilidad" },

    { metodo: "POST", ruta: "/proyecto/:id/postular", descripcion: "Postular a un proyecto (autenticado)" },
    { metodo: "POST", ruta: "/equipo/:id/solicitar", descripcion: "Solicitar unirse a un equipo (autenticado)" },
    { metodo: "GET", ruta: "/mis-solicitudes-enviadas", descripcion: "Solicitudes que envié a equipos" },
    { metodo: "GET", ruta: "/mis-solicitudes-equipo", descripcion: "Solicitudes pendientes de mis equipos (creador/aprueba)" },
    { metodo: "PUT", ruta: "/solicitud-equipo/:id/estado", descripcion: "Aprobar o rechazar solicitud de equipo" },
    { metodo: "DELETE", ruta: "/solicitud-equipo/own/:id", descripcion: "Cancelar mi solicitud pendiente" },
    { metodo: "PUT", ruta: "/equipo/:id/miembros/:miembroId/rol", descripcion: "Cambiar rol de integrante (creador/admin/mentor)" },
    { metodo: "DELETE", ruta: "/equipo/:id/miembros/:miembroId", descripcion: "Quitar integrante del equipo (creador/admin/mentor)" },
    { metodo: "POST", ruta: "/recurso-aprendizaje/:id/calificar", descripcion: "Crear/actualizar mi reseña del recurso (autenticado)" },
    { metodo: "DELETE", ruta: "/recurso-aprendizaje/own/:id/calificacion", descripcion: "Eliminar mi reseña del recurso (autenticado)" },
    { metodo: "GET", ruta: "/proyecto/:id/comentarios", descripcion: "Comentarios de un proyecto" },
    { metodo: "POST", ruta: "/proyecto/:id/comentar", descripcion: "Comentar un proyecto (autenticado)" },
    { metodo: "DELETE", ruta: "/comentario/:id", descripcion: "Eliminar comentario (autor/creador/admin)" },

    { metodo: "GET", ruta: "/stats", descripcion: "Estadísticas generales de la plataforma" },
    { metodo: "GET", ruta: "/admin/stats", descripcion: "Métricas ampliadas del administrador" },

    { metodo: "GET", ruta: "/logros", descripcion: "Catálogo de logros (público)" },
    { metodo: "GET", ruta: "/mis-logros", descripcion: "Verificar y listar mis logros (autenticado)" },
    { metodo: "GET", ruta: "/logros/usuario/:id", descripcion: "Logros obtenidos por un usuario (público)" },

    { metodo: "GET", ruta: "/ofertas", descripcion: "Listar ofertas (público, token opcional)" },
    { metodo: "GET", ruta: "/oferta/:id", descripcion: "Ver oferta por id (público)" },
    { metodo: "POST", ruta: "/oferta/agregar", descripcion: "Crear oferta (admin/mentor)" },
    { metodo: "PUT", ruta: "/oferta/:id", descripcion: "Actualizar oferta (admin/mentor o quien la publicó)" },
    { metodo: "DELETE", ruta: "/oferta/:id", descripcion: "Eliminar oferta (admin/mentor o quien la publicó)" },
    { metodo: "POST", ruta: "/oferta/:id/postular", descripcion: "Postular a una oferta (autenticado)" },
    { metodo: "GET", ruta: "/mis-postulaciones-ofertas", descripcion: "Mis postulaciones a ofertas (autenticado)" },
    { metodo: "DELETE", ruta: "/postulacion-oferta-own/:id", descripcion: "Retirar mi postulación pendiente (autenticado)" },
    { metodo: "GET", ruta: "/oferta/:id/postulaciones", descripcion: "Postulaciones de una oferta (admin/mentor o publicador)" },
    { metodo: "PUT", ruta: "/postulacion-oferta/:id/estado", descripcion: "Responder postulación de oferta (admin/mentor o publicador)" }
];

router.get('/', (req, res) => {
    res.json({
        nombre: "NexoraLabs API",
        version: "1.0.0",
        estado: "en línea",
        documentacion: "/",
        total_rutas: rutas.length,
        rutas
    });
});

export default router;
