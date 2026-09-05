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
const obtenerToken = async () => {
    const res = await request(app)
        .post("/usuario/login")
        .send({ email: usuarioPrueba.email, password: usuarioPrueba.password });
    return res.body.token;
};

describe("Autenticación", () => {
    test("Registrar un usuario nuevo responde 200 y oculta el password", async () => {
        const res = await request(app).post("/usuario/registro").send(usuarioPrueba);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("email", usuarioPrueba.email);
        expect(res.body).not.toHaveProperty("password");
    });

    test("Registrar el mismo email responde 409 (conflicto)", async () => {
        const res = await request(app).post("/usuario/registro").send(usuarioPrueba);

        expect(res.status).toBe(409);
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