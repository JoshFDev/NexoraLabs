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
    { metodo: "DELETE", ruta: "/proyecto-habilidad/:id", descripcion: "Eliminar relación proyecto-habilidad" }
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
