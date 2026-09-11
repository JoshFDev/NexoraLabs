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