import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import indexRoutes from './routes/indexRoutes';
import equipoRoutes from './routes/equipo.routes';
import usuarioRoutes from './routes/usuario.routes'
import proyectoRoutes from './routes/proyecto.routes';
import habilidadRoutes from './routes/habilidad.routes';
import recursoAprendizajeRoutes from './routes/recursoAprendizaje.routes';
import postulacionRoutes from './routes/postulacion.routes';
import usuarioHabilidadRoutes from './routes/usuarioHabilidad.routes';
import proyectoHabilidadRoutes from './routes/proyectoHabilidad.routes';
import miembroEquipoRoutes from './routes/miembroEquipo.routes';
import statsRoutes from './routes/stats.routes';
import exphbs from "express-handlebars";
import path from "path";
import notFound from './shared/errors/notFound';
import errorHandlerMiddleware from './shared/errors/errorHandlerMiddleware';

const app = express();

app.set("views", path.join(__dirname, "views"));
app.engine(
    ".hbs",
    exphbs({
        layoutsDir: path.join(app.get("views"), "layouts"),
        defaultLayout: "main",
        extname: ".hbs"
    }));

//middleware
//SEGURIDAD 1: helmet añade cabeceras HTTP seguras (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet());

//SEGURIDAD 2: cors permite que otros dominios (el futuro frontend) consuman la API
app.use(cors());

//En modo test se desactivan morgan y el limitador general para no ensuciar ni bloquear las pruebas
if (process.env.NODE_ENV !== "test") {
    app.use(morgan('dev'));

    //SEGURIDAD 3: limitar las peticiones por IP para evitar abusos (ataques de fuerza bruta, spam)
    //300 peticiones cada 15 minutos por IP; al superarlas responde 429 Too Many Requests
    const limitadorGeneral = rateLimit({
        windowMs: 15 * 60 * 1000, // ventana de tiempo: 15 minutos (en milisegundos)
        limit: 300,               // máximo de peticiones permitidas en esa ventana
        standardHeaders: true,    // expone las cabeceras estándar RateLimit-* en la respuesta
        legacyHeaders: false,     // desactiva las cabeceras antiguas (X-RateLimit-*)
        message: { error: "Demasiadas peticiones, inténtalo de nuevo más tarde" }
    });
    app.use(limitadorGeneral);
}

app.use(express.urlencoded({extended: false}));
app.use(express.json())
//rutas
app.set("view engine", ".hbs");

app.use(indexRoutes);
app.use(equipoRoutes);
app.use(usuarioRoutes);
app.use(habilidadRoutes);
app.use(proyectoRoutes);
app.use(recursoAprendizajeRoutes);
app.use(postulacionRoutes);
app.use(usuarioHabilidadRoutes);
app.use(proyectoHabilidadRoutes);
app.use(miembroEquipoRoutes);
app.use(statsRoutes);

//Manejo de errores (después de todas las rutas)
app.use(notFound);
app.use(errorHandlerMiddleware);

export default app; //Exporto el obj