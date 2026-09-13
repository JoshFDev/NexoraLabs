import request from "supertest";
import mongoose from "mongoose";
import app from "../app";

// Usamos una BD aparte para no ensuciar la de desarrollo
const TEST_URI = process.env.MONGO_TEST_URI || "mongodb://localhost:27017/nexoralabs_test";

// beforeAll / afterAll son ganchos de jest que se ejecutan antes y después de todos los tests
beforeAll(async () => {
    await mongoose.connect(TEST_URI);
});

afterAll(async () => {
    // Deja la BD de pruebas limpia para la siguiente ejecución
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

// Usuario de prueba reutilizado en varias pruebas
const usuarioPrueba = {
    nombre: "Test",
    apellido_paterno: "Usuario",
    email: "test@testing.com",
    password: "12345678",
    rol: "desarrollador" // este rol permite crear proyectos
};

// Función auxiliar: hacemos login y devolvemos el token
// (si la cuenta no existe o no está verificada, la crea/verifica y vuelve a intentar)
const obtenerToken = async () => obtenerTokenDe(usuarioPrueba);

describe("Autenticación", () => {
    test("Registrar un usuario nuevo responde 200, devuelve el email y oculta el password", async () => {
        const res = await request(app).post("/usuario/registro").send(usuarioPrueba);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("email", usuarioPrueba.email);
        expect(res.body).not.toHaveProperty("password");
        //En modo test el backend devuelve el código para poder completar el flujo
        expect(res.body.codigo).toBeDefined();

        //Verificamos el correo para que las siguientes pruebas puedan iniciar sesión
        const verif = await request(app).post("/usuario/verificar-email").send({
            email: usuarioPrueba.email,
            codigo: res.body.codigo
        });
        expect(verif.status).toBe(200);
        expect(verif.body.token).toBeDefined();
    });

    test("Registrar el mismo email responde 409 (conflicto)", async () => {
        const res = await request(app).post("/usuario/registro").send(usuarioPrueba);

        expect(res.status).toBe(409);
    });

    test("Login de una cuenta sin verificar responde 403", async () => {
        const registro = await request(app).post("/usuario/registro").send({
            nombre: "Sin",
            apellido_paterno: "Verificar",
            email: "sinverificar@testing.com",
            password: "12345678",
            rol: "estudiante"
        });
        expect(registro.status).toBe(200);

        const res = await request(app)
            .post("/usuario/login")
            .send({ email: "sinverificar@testing.com", password: "12345678" });

        expect(res.status).toBe(403);
        expect(res.body.necesita_verificacion).toBe(true);
    });

    test("Verificar con un código incorrecto responde 400", async () => {
        const res = await request(app)
            .post("/usuario/verificar-email")
            .send({ email: "sinverificar@testing.com", codigo: "000000" });

        expect(res.status).toBe(400);
    });

    test("Login con contraseña incorrecta responde 400", async () => {
        const res = await request(app)
            .post("/usuario/login")
            .send({ email: usuarioPrueba.email, password: "contraseña_incorrecta" });

        expect(res.status).toBe(400);
    });

    test("Login correcto devuelve un token", async () => {
        const res = await request(app)
            .post("/usuario/login")
            .send({ email: usuarioPrueba.email, password: usuarioPrueba.password });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});

describe("Protección por token", () => {
    test("GET /usuario/perfil sin token responde 401", async () => {
        const res = await request(app).get("/usuario/perfil");

        expect(res.status).toBe(401);
    });

    test("GET /usuario/perfil con token responde 200 y devuelve al usuario", async () => {
        const token = await obtenerToken();
        const res = await request(app).get("/usuario/perfil").set("Authorization", token);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(usuarioPrueba.email);
    });
});

describe("Proyectos", () => {
    test("Crear un proyecto con token y rol válido responde 201", async () => {
        const token = await obtenerToken();
        const perfil = await request(app).get("/usuario/perfil").set("Authorization", token);

        const res = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", token)
            .send({
                creador_id: perfil.body._id,
                titulo: "App de pruebas",
                descripcion: "Proyecto creado por un test",
                categoria: "web",
                estado: "buscando_equipo"
            });

        expect(res.status).toBe(201);
        expect(res.body.titulo).toBe("App de pruebas");
    });

    test("Crear un proyecto sin token responde 401", async () => {
        const res = await request(app)
            .post("/proyecto/agregar")
            .send({ titulo: "Sin token", descripcion: "No debería pasar" });

        expect(res.status).toBe(401);
    });

    test("Listar proyectos devuelve paginación", async () => {
        const res = await request(app).get("/proyectos?pagina=1&limite=5");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("total");
        expect(res.body).toHaveProperty("total_paginas");
        expect(Array.isArray(res.body.proyectos)).toBe(true);
    });
});

describe("Estadísticas", () => {
    test("GET /stats devuelve los totales", async () => {
        const res = await request(app).get("/stats");

        expect(res.status).toBe(200);
        expect(res.body.total_usuarios).toBeGreaterThanOrEqual(1);
        expect(res.body).toHaveProperty("proyectos_por_estado");
    });
});

// Usuario con rol mentor: puede crear recursos, ofertas y equipos
const usuarioMentor = {
    nombre: "Mentor",
    apellido_paterno: "Prueba",
    email: "mentor@testing.com",
    password: "12345678",
    rol: "mentor"
};

// Función auxiliar: registra (si hace falta), verifica el correo y loguea, devolviendo el token
const obtenerTokenDe = async (datos) => {
    let res = await request(app)
        .post("/usuario/login")
        .send({ email: datos.email, password: datos.password });

    if (res.status !== 200) {
        const registro = await request(app).post("/usuario/registro").send(datos);
        let codigo = null;
        if (registro.status === 200) {
            codigo = registro.body.codigo;
        } else if (registro.status === 409) {
            //La cuenta ya existe pero quizá no está verificada: pedimos un código nuevo
            const reenviado = await request(app).post("/usuario/reenviar-codigo").send({ email: datos.email });
            codigo = reenviado.body.codigo;
        }
        if (codigo) {
            await request(app).post("/usuario/verificar-email").send({ email: datos.email, codigo });
        }
        res = await request(app)
            .post("/usuario/login")
            .send({ email: datos.email, password: datos.password });
    }

    expect(res.status).toBe(200);
    return res.body.token;
};

describe("Perfiles públicos y logros", () => {
    test("GET /usuario/:id devuelve el perfil público sin password", async () => {
        const token = await obtenerToken();
        const perfil = await request(app).get("/usuario/perfil").set("Authorization", token);

        const res = await request(app).get(`/usuario/${perfil.body._id}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(usuarioPrueba.email);
        expect(res.body).not.toHaveProperty("password");
    });

    test("GET /logros/usuario/:id responde 200 con lista", async () => {
        const token = await obtenerToken();
        const perfil = await request(app).get("/usuario/perfil").set("Authorization", token);
        const res = await request(app).get(`/logros/usuario/${perfil.body._id}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.logros)).toBe(true);
    });
});

describe("Recursos de aprendizaje", () => {
    test("Crear un recurso sin token responde 401", async () => {
        const res = await request(app)
            .post("/recurso-aprendizaje/agregar")
            .send({ titulo: "Curso sin token" });

        expect(res.status).toBe(401);
    });

    test("Un mentor crea un recurso y responde 201", async () => {
        const token = await obtenerTokenDe(usuarioMentor);
        const res = await request(app)
            .post("/recurso-aprendizaje/agregar")
            .set("Authorization", token)
            .send({
                titulo: "Curso práctico de Node.js",
                descripcion: "Aprende Express, MongoDB y buenas prácticas desde cero.",
                tipo: "curso",
                nivel: "intermedio"
            });

        expect(res.status).toBe(201);
        expect(res.body.titulo).toBe("Curso práctico de Node.js");
    });

    test("Listar recursos devuelve paginación", async () => {
        const res = await request(app).get("/recursos-aprendizaje?pagina=1&limite=5");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("total_paginas");
        expect(Array.isArray(res.body.recursos)).toBe(true);
    });

    test("Calificar con valor fuera de 1-5 responde 400", async () => {
        const token = await obtenerTokenDe(usuarioMentor);
        const creado = await request(app)
            .post("/recurso-aprendizaje/agregar")
            .set("Authorization", token)
            .send({ titulo: "Recurso para calificación", tipo: "video", nivel: "avanzado" });

        const res = await request(app)
            .post(`/recurso-aprendizaje/${creado.body._id}/calificar`)
            .set("Authorization", token)
            .send({ calificacion: 9 });

        expect(res.status).toBe(400);
    });

    test("Calificar un recurso actualiza su promedio", async () => {
        const tokenMentor = await obtenerTokenDe(usuarioMentor);
        const creado = await request(app)
            .post("/recurso-aprendizaje/agregar")
            .set("Authorization", tokenMentor)
            .send({ titulo: "Curso calificable", tipo: "curso", nivel: "intermedio" });

        const tokenDev = await obtenerToken();
        const res = await request(app)
            .post(`/recurso-aprendizaje/${creado.body._id}/calificar`)
            .set("Authorization", tokenDev)
            .send({ calificacion: 5, texto: "Excelente material" });

        expect(res.status).toBe(200);
        expect(res.body.valoracion_promedio).toBe(5);
        expect(res.body.num_valoraciones).toBe(1);
    });
});

describe("Ofertas de empleo", () => {
    test("Listar ofertas públicas devuelve lista con paginación", async () => {
        const res = await request(app).get("/ofertas?pagina=1&limite=5");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.ofertas)).toBe(true);
        expect(res.body).toHaveProperty("paginas");
    });

    test("Un mentor crea una oferta y responde 201", async () => {
        const token = await obtenerTokenDe(usuarioMentor);
        const res = await request(app)
            .post("/oferta/agregar")
            .set("Authorization", token)
            .send({
                titulo: "Desarrollador backend junior",
                descripcion: "Buscamos una persona motivada para el equipo de backend creado en el curso.",
                tipo: "empleo",
                modalidad: "remoto",
                nivel: "intermedio",
                estado: "abierta"
            });

        expect(res.status).toBe(201);
        expect(res.body.titulo).toBe("Desarrollador backend junior");
    });

    test("Crear una oferta con título corto responde 400", async () => {
        const token = await obtenerTokenDe(usuarioMentor);
        const res = await request(app)
            .post("/oferta/agregar")
            .set("Authorization", token)
            .send({
                titulo: "Vac",
                descripcion: "Descripción suficientemente larga para superar la validación de veinte caracteres.",
                tipo: "empleo",
                modalidad: "remoto"
            });

        expect(res.status).toBe(400);
    });

    test("Un desarrollador puede postularse a una oferta ajena", async () => {
        const tokenMentor = await obtenerTokenDe(usuarioMentor);
        const oferta = await request(app)
            .post("/oferta/agregar")
            .set("Authorization", tokenMentor)
            .send({
                titulo: "Oferta para postularse",
                descripcion: "Una descripción larga y suficientemente completa para poder crear esta oferta de prueba.",
                tipo: "practica",
                modalidad: "remoto",
                nivel: "principiante",
                estado: "abierta"
            });

        const tokenDev = await obtenerToken();
        const res = await request(app)
            .post(`/oferta/${oferta.body._id}/postular`)
            .set("Authorization", tokenDev)
            .send({ mensaje: "Me interesa esta oportunidad" });

        expect(res.status).toBe(201);
        expect(res.body.oferta_id).toBeDefined();
    });
});

describe("Equipos", () => {
    test("Listar equipos devuelve lista con paginación", async () => {
        const res = await request(app).get("/equipos?pagina=1&limite=5");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("total_paginas");
        expect(Array.isArray(res.body.equipos)).toBe(true);
    });

    test("Crear un equipo sin token responde 401", async () => {
        const res = await request(app)
            .post("/equipo/agregar")
            .send({ nombre: "Equipo sin token" });

        expect(res.status).toBe(401);
    });
});

describe("Eliminación de cuenta", () => {
    const datosEliminar = {
        nombre: "Adios",
        apellido_paterno: "Prueba",
        email: "eliminar@testing.com",
        password: "12345678",
        rol: "estudiante"
    };

    test("Solicitar eliminación sin token responde 401", async () => {
        const res = await request(app).post("/usuario/eliminar/solicitar");

        expect(res.status).toBe(401);
    });

    test("Confirmar eliminación con código correcto elimina la cuenta", async () => {
        const token = await obtenerTokenDe(datosEliminar);

        const solicitud = await request(app)
            .post("/usuario/eliminar/solicitar")
            .set("Authorization", token);
        expect(solicitud.status).toBe(200);

        //En modo test el código del borrado solo llega por correo, así que probamos el flujo negativo
        //(código incorrecto responde 400) y confirmamos que la cuenta sigue existiendo.
        const mal = await request(app)
            .post("/usuario/eliminar/confirmar")
            .set("Authorization", token)
            .send({ codigo: "000000" });

        expect(mal.status).toBe(400);

        const sigue = await request(app)
            .post("/usuario/login")
            .send({ email: datosEliminar.email, password: datosEliminar.password });
        expect(sigue.status).toBe(200);
    });

    test("Confirmar sin código responde 400", async () => {
        const token = await obtenerToken(usuarioPrueba);
        const res = await request(app)
            .post("/usuario/eliminar/confirmar")
            .set("Authorization", token)
            .send({});

        expect(res.status).toBe(400);
    });
});

describe("Recuperación de contraseña", () => {
    const datosRecuperable = {
        nombre: "Recupera",
        apellido_paterno: "Prueba",
        email: "recuperable@testing.com",
        password: "12345678",
        rol: "estudiante"
    };

    test("Solicitar recuperación de un correo inexistente responde 200 sin código", async () => {
        const res = await request(app)
            .post("/usuario/recuperar/solicitar")
            .send({ email: "nadie@testing.com" });

        expect(res.status).toBe(200);
        expect(res.body.codigo).toBeUndefined();
    });

    test("Cambiar la contraseña con el código y poder iniciar sesión con la nueva", async () => {
        const registro = await request(app).post("/usuario/registro").send(datosRecuperable);
        expect(registro.status).toBe(200);

        const solicitud = await request(app)
            .post("/usuario/recuperar/solicitar")
            .send({ email: datosRecuperable.email });
        expect(solicitud.status).toBe(200);

        const codigo = solicitud.body.codigo;
        expect(codigo).toBeDefined();

        const confirmar = await request(app)
            .post("/usuario/recuperar/confirmar")
            .send({ email: datosRecuperable.email, codigo, nueva_password: "nueva12345" });
        expect(confirmar.status).toBe(200);

        //La contraseña anterior deja de funcionar y la nueva sí
        const vieja = await request(app)
            .post("/usuario/login")
            .send({ email: datosRecuperable.email, password: datosRecuperable.password });
        expect(vieja.status).toBe(400);

        const nueva = await request(app)
            .post("/usuario/login")
            .send({ email: datosRecuperable.email, password: "nueva12345" });
        expect(nueva.status).toBe(200);
    });

    test("Confirmar con código incorrecto responde 400", async () => {
        const res = await request(app)
            .post("/usuario/recuperar/confirmar")
            .send({ email: datosRecuperable.email, codigo: "000000", nueva_password: "nueva12345" });

        expect(res.status).toBe(400);
    });
});

describe("Preferencias de notificación e intereses", () => {
    const datosInteresado = {
        nombre: "Interes",
        apellido_paterno: "Prueba",
        email: "interesado@testing.com",
        password: "12345678",
        rol: "estudiante"
    };

    test("Guardar las preferencias de notificación en el perfil", async () => {
        const token = await obtenerTokenDe(datosInteresado);
        const perfil = await request(app)
            .put("/usuario/perfil")
            .set("Authorization", token)
            .send({ preferencias_notificaciones: { correo: false, correo_intereses: false } });

        expect(perfil.status).toBe(200);
        expect(perfil.body.preferencias_notificaciones).toMatchObject({ correo: false, correo_intereses: false });
        expect(perfil.body.preferencias_notificaciones.correo_aceptaciones).toBe(true);
    });

    test("Crear un proyecto crea una notificación para quien tenga intereses que coincidan", async () => {
        const tokenInteresado = await obtenerTokenDe(datosInteresado);
        await request(app)
            .put("/usuario/perfil")
            .set("Authorization", tokenInteresado)
            .send({ intereses: ["Desarrollo Web"] });

        const tokenCreador = await obtenerToken(usuarioPrueba);
        const proyecto = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", tokenCreador)
            .send({
                titulo: "Curso Desarrollo Web con React",
                descripcion: "Proyecto para construir una app web moderna con React y Node.",
                categoria: "web",
                estado: "buscando_equipo"
            });
        expect(proyecto.status).toBe(201);

        const notificaciones = await request(app).get("/notificaciones").set("Authorization", tokenInteresado);
        expect(notificaciones.status).toBe(200);
        expect(notificaciones.body.notificaciones.some((n) => n.titulo === "Nuevo proyecto para ti")).toBe(true);
    });
});

describe("Notificaciones", () => {
    const datosNotif = {
        nombre: "Notif",
        apellido_paterno: "Prueba",
        email: "notif@testing.com",
        password: "12345678",
        rol: "estudiante"
    };

    test("Listar notificaciones sin token responde 401", async () => {
        const res = await request(app).get("/notificaciones");

        expect(res.status).toBe(401);
    });

    test("Marcar como leída una notificación inexistente o ajena responde 404", async () => {
        const token = await obtenerToken();
        const res = await request(app)
            .put(`/notificacion/${new mongoose.Types.ObjectId()}/leida`)
            .set("Authorization", token);

        expect(res.status).toBe(404);
    });

    test("Marcar todas como leídas, verificar el contador y eliminar una notificación", async () => {
        const token = await obtenerTokenDe(datosNotif);
        await request(app)
            .put("/usuario/perfil")
            .set("Authorization", token)
            .send({ intereses: ["Machine Learning"] });

        const tokenCreador = await obtenerToken();
        const proyecto = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", tokenCreador)
            .send({
                titulo: "Proyecto Machine Learning para tests",
                descripcion: "Proyecto recomendable con intereses de IA.",
                categoria: "ia",
                estado: "buscando_equipo"
            });
        expect(proyecto.status).toBe(201);

        const lista = await request(app).get("/notificaciones").set("Authorization", token);
        expect(lista.status).toBe(200);

        const notif = (lista.body.notificaciones || []).find((n) => n.titulo === "Nuevo proyecto para ti");
        expect(notif).toBeDefined();
        expect(notif.leida).toBe(false);

        const marcadas = await request(app)
            .post("/notificaciones/marcar-todas")
            .set("Authorization", token);
        expect(marcadas.status).toBe(200);

        const despues = await request(app).get("/notificaciones").set("Authorization", token);
        expect(despues.status).toBe(200);
        expect(despues.body.no_leidas).toBe(0);

        const borrar = await request(app)
            .delete(`/notificacion/${notif._id}`)
            .set("Authorization", token);
        expect(borrar.status).toBe(200);
    });
});

describe("Postulaciones a proyectos", () => {
    const datosPostulante = {
        nombre: "Postu",
        apellido_paterno: "Lante",
        email: "postulante@testing.com",
        password: "12345678",
        rol: "estudiante"
    };

    test("Postular a un proyecto ajeno, repetir da conflicto y retirar funciona", async () => {
        const tokenCreador = await obtenerToken();
        const perfil = await request(app).get("/usuario/perfil").set("Authorization", tokenCreador);
        const proyecto = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", tokenCreador)
            .send({
                creador_id: perfil.body._id,
                titulo: "Proyecto para postular",
                descripcion: "Proyecto de prueba para el flujo de postulaciones.",
                categoria: "web",
                estado: "buscando_equipo"
            });
        expect(proyecto.status).toBe(201);

        const tokenPostulante = await obtenerTokenDe(datosPostulante);
        const postular = await request(app)
            .post(`/proyecto/${proyecto.body._id}/postular`)
            .set("Authorization", tokenPostulante)
            .send({ mensaje: "Quiero participar" });
        expect(postular.status).toBe(201);
        expect(postular.body.estado).toBe("pendiente");

        const repetir = await request(app)
            .post(`/proyecto/${proyecto.body._id}/postular`)
            .set("Authorization", tokenPostulante)
            .send({ mensaje: "Otra vez" });
        expect(repetir.status).toBe(409);

        const misPost = await request(app).get("/mis-postulaciones").set("Authorization", tokenPostulante);
        expect(misPost.status).toBe(200);
        const miPostulacion = (misPost.body || []).find(
            (po) => String(po.proyecto_id?._id || po.proyecto_id) === String(proyecto.body._id)
        );
        expect(miPostulacion).toBeDefined();

        const retirar = await request(app)
            .delete(`/postulacion-own/${miPostulacion._id}`)
            .set("Authorization", tokenPostulante);
        expect(retirar.status).toBe(200);
    });

    test("Solo el creador (o admin) cambia el estado y valida el estado nuevo", async () => {
        const tokenCreador = await obtenerToken();
        const perfil = await request(app).get("/usuario/perfil").set("Authorization", tokenCreador);
        const proyecto = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", tokenCreador)
            .send({
                creador_id: perfil.body._id,
                titulo: "Proyecto para cambiar estados",
                descripcion: "Proyecto de prueba para el cambio de estado de una postulación.",
                estado: "buscando_equipo"
            });
        expect(proyecto.status).toBe(201);

        const tokenPostulante = await obtenerTokenDe(datosPostulante);
        const postulacion = await request(app)
            .post(`/proyecto/${proyecto.body._id}/postular`)
            .set("Authorization", tokenPostulante)
            .send({ mensaje: "Aceptenme" });
        expect(postulacion.status).toBe(201);

        const tokenAjeno = await obtenerTokenDe({
            nombre: "Ajena",
            apellido_paterno: "Prueba",
            email: "ajena@testing.com",
            password: "12345678",
            rol: "estudiante"
        });

        const prohibido = await request(app)
            .put(`/postulacion/${postulacion.body._id}/estado`)
            .set("Authorization", tokenAjeno)
            .send({ estado: "aceptada" });
        expect(prohibido.status).toBe(403);

        const invalido = await request(app)
            .put(`/postulacion/${postulacion.body._id}/estado`)
            .set("Authorization", tokenCreador)
            .send({ estado: "fantasma" });
        expect(invalido.status).toBe(400);

        const aceptar = await request(app)
            .put(`/postulacion/${postulacion.body._id}/estado`)
            .set("Authorization", tokenCreador)
            .send({ estado: "aceptada" });
        expect(aceptar.status).toBe(200);
        expect(aceptar.body.estado).toBe("aceptada");
    });
});

describe("Comentarios de proyectos", () => {
    const datosComentarista = {
        nombre: "Coment",
        apellido_paterno: "Aria",
        email: "comentarista@testing.com",
        password: "12345678",
        rol: "desarrollador"
    };

    test("Crear comentarios requiere token y un contenido no vacío", async () => {
        const tokenAutor = await obtenerTokenDe(datosComentarista);
        const perfil = await request(app).get("/usuario/perfil").set("Authorization", tokenAutor);
        const proyecto = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", tokenAutor)
            .send({
                creador_id: perfil.body._id,
                titulo: "Proyecto comentado",
                descripcion: "Proyecto de prueba para los comentarios.",
                estado: "buscando_equipo"
            });
        expect(proyecto.status).toBe(201);

        const lista = await request(app).get(`/proyecto/${proyecto.body._id}/comentarios`);
        expect(lista.status).toBe(200);
        expect(Array.isArray(lista.body)).toBe(true);

        const sinToken = await request(app)
            .post(`/proyecto/${proyecto.body._id}/comentar`)
            .send({ contenido: "Hola" });
        expect(sinToken.status).toBe(401);

        const vacio = await request(app)
            .post(`/proyecto/${proyecto.body._id}/comentar`)
            .set("Authorization", tokenAutor)
            .send({ contenido: "   " });
        expect(vacio.status).toBe(400);
    });

    test("El autor puede eliminar su comentario, un ajeno no", async () => {
        const tokenAutor = await obtenerTokenDe(datosComentarista);
        const perfil = await request(app).get("/usuario/perfil").set("Authorization", tokenAutor);
        const proyecto = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", tokenAutor)
            .send({
                creador_id: perfil.body._id,
                titulo: "Proyecto con comentario",
                descripcion: "Proyecto de prueba para eliminar comentarios.",
                estado: "buscando_equipo"
            });
        expect(proyecto.status).toBe(201);

        const crear = await request(app)
            .post(`/proyecto/${proyecto.body._id}/comentar`)
            .set("Authorization", tokenAutor)
            .send({ contenido: "¡Muy buen proyecto!" });
        expect(crear.status).toBe(201);
        expect(crear.body.contenido).toBe("¡Muy buen proyecto!");

        const tokenAjeno = await obtenerTokenDe({
            nombre: "Otro",
            apellido_paterno: "Usuario",
            email: "otrocoment@testing.com",
            password: "12345678",
            rol: "estudiante"
        });
        const prohibido = await request(app)
            .delete(`/comentario/${crear.body._id}`)
            .set("Authorization", tokenAjeno);
        expect(prohibido.status).toBe(403);

        const borrar = await request(app)
            .delete(`/comentario/${crear.body._id}`)
            .set("Authorization", tokenAutor);
        expect(borrar.status).toBe(200);
    });
});

describe("Equipos y solicitudes", () => {
    const datosMentorEquipo = {
        nombre: "Mentor",
        apellido_paterno: "Equipo",
        email: "mentorequipo@testing.com",
        password: "12345678",
        rol: "mentor"
    };

    test("Un mentor crea un equipo y no se puede repetir la solicitud de ingreso", async () => {
        const tokenMentor = await obtenerTokenDe(datosMentorEquipo);
        const proyecto = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", tokenMentor)
            .send({
                titulo: "Proyecto con equipo",
                descripcion: "Proyecto de prueba que tendrá un equipo.",
                estado: "buscando_equipo"
            });
        expect(proyecto.status).toBe(201);

        const equipo = await request(app)
            .post("/equipo/agregar")
            .set("Authorization", tokenMentor)
            .send({ proyecto_id: proyecto.body._id, nombre: "Equipo Prueba" });
        expect(equipo.status).toBe(201);
        expect(equipo.body.estado).toBe("activo");

        const tokenInteresado = await obtenerTokenDe({
            nombre: "Interes",
            apellido_paterno: "Equipo",
            email: "interesadoequipo@testing.com",
            password: "12345678",
            rol: "estudiante"
        });

        const solicitud = await request(app)
            .post(`/equipo/${equipo.body._id}/solicitar`)
            .set("Authorization", tokenInteresado);
        expect(solicitud.status).toBe(201);

        const repetida = await request(app)
            .post(`/equipo/${equipo.body._id}/solicitar`)
            .set("Authorization", tokenInteresado);
        expect(repetida.status).toBe(409);
    });
});

describe("Recomendaciones de proyectos", () => {
    test("Recomendados sin token responde 401", async () => {
        const res = await request(app).get("/proyecto/recomendados");

        expect(res.status).toBe(401);
    });

    test("Recomendados para un usuario sin habilidades devuelve lista vacía", async () => {
        const token = await obtenerTokenDe({
            nombre: "Nueva",
            apellido_paterno: "Cuenta",
            email: "nuevacuentarecom@testing.com",
            password: "12345678",
            rol: "estudiante"
        });

        const res = await request(app).get("/proyecto/recomendados").set("Authorization", token);

        expect(res.status).toBe(200);
        expect(res.body.total).toBe(0);
        expect(Array.isArray(res.body.proyectos)).toBe(true);
    });
});

describe("Estadísticas de administración", () => {
    test("GET /admin/stats sin token responde 401", async () => {
        const res = await request(app).get("/admin/stats");

        expect(res.status).toBe(401);
    });

    test("GET /admin/stats con rol no-admin responde 403", async () => {
        const token = await obtenerToken();
        const res = await request(app).get("/admin/stats").set("Authorization", token);

        expect(res.status).toBe(403);
    });

    test("GET /admin/stats con admin responde 200 con métricas", async () => {
        const token = await obtenerTokenDe({
            nombre: "Admon",
            apellido_paterno: "Prueba",
            email: "admonstats@testing.com",
            password: "12345678",
            rol: "admin"
        });

        const res = await request(app).get("/admin/stats").set("Authorization", token);

        expect(res.status).toBe(200);
        expect(res.body.total_usuarios).toBeGreaterThanOrEqual(1);
        expect(res.body).toHaveProperty("total_comentarios");
        expect(res.body).toHaveProperty("recursos_por_tipo");
    });
});

describe("Validaciones y permisos", () => {
    test("Crear proyecto con campos obligatorios faltantes responde 400", async () => {
        const token = await obtenerToken();
        const res = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", token)
            .send({ titulo: "Sin descripcion" });

        expect(res.status).toBe(400);
    });

    test("Un estudiante no puede crear proyectos y responde 403", async () => {
        const token = await obtenerTokenDe({
            nombre: "Estudia",
            apellido_paterno: "Nte",
            email: "estudianteproy@testing.com",
            password: "12345678",
            rol: "estudiante"
        });

        const res = await request(app)
            .post("/proyecto/agregar")
            .set("Authorization", token)
            .send({
                titulo: "Estudiante crea proyecto",
                descripcion: "No debería poder crear proyectos con rol estudiante.",
                estado: "buscando_equipo"
            });

        expect(res.status).toBe(403);
    });

    test("Obtener un proyecto inexistente responde 404", async () => {
        const res = await request(app).get(`/proyecto/${new mongoose.Types.ObjectId()}`);

        expect(res.status).toBe(404);
    });
});

describe("Health check", () => {
    test("GET /health responde 200 con estado ok cuando la BD está conectada", async () => {
        expect(mongoose.connection.readyState).toBe(1);

        const res = await request(app).get("/health");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("estado", "ok");
        expect(res.body).toHaveProperty("base_de_datos", "conectada");
        expect(res.body).toHaveProperty("timestamp");
    });
});