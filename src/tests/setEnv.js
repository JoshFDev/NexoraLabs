//Este archivo se ejecuta ANTES de cargar los tests y la app
import "dotenv/config"; // carga el JWT_SECRET desde el .env

//Con NODE_ENV=test, app.js desactiva morgan y los limitadores de peticiones
process.env.NODE_ENV = "test";