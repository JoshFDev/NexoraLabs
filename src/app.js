import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import indexRoutes from "./routes/indexRoutes";
import equipoRoutes from "./routes/equipo.routes";
import usuarioRoutes from "./routes/usuario.routes";
import proyectoRoutes from "./routes/proyecto.routes";
import habilidadRoutes from "./routes/habilidad.routes";
import recursoAprendizajeRoutes from "./routes/recursoAprendizaje.routes";
import postulacionRoutes from "./routes/postulacion.routes";
import comentarioRoutes from "./routes/comentario.routes";
import usuarioHabilidadRoutes from "./routes/usuarioHabilidad.routes";
import proyectoHabilidadRoutes from "./routes/proyectoHabilidad.routes";
import miembroEquipoRoutes from "./routes/miembroEquipo.routes";
import solicitudEquipoRoutes from "./routes/solicitudEquipo.routes";
import mensajeEquipoRoutes from "./routes/mensajeEquipo.routes";
import notificacionRoutes from "./routes/notificacion.routes";
import statsRoutes from "./routes/stats.routes";
import logroRoutes from "./routes/logro.routes";
import ofertaRoutes from "./routes/oferta.routes";
import exphbs from "express-handlebars";
import path from "path";
import notFound from "./shared/errors/notFound";
import errorHandlerMiddleware from "./shared/errors/errorHandlerMiddleware";
import { origenesPermitidos } from "./config/entorno";

const app = express();

app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    layoutsDir: path.join(app.get("views"), "layouts"),
    defaultLayout: "main",
    extname: ".hbs"
  })
);

//middleware
//SEGURIDAD 1: helmet añade cabeceras HTTP seguras (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet());

//SEGURIDAD 2: cors permite que solo los origenes configurados consuman la API.
//En desarrollo se aceptan los locales y en modo test cualquier origen.
const origenesPermitidosConfig = origenesPermitidos();
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || process.env.NODE_ENV === "test" || origenesPermitidosConfig.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    }
  })
);

//En modo test se desactivan morgan y el limitador general para no ensuciar ni bloquear las pruebas
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));

  //SEGURIDAD 3: limitar las peticiones por IP para evitar abusos (ataques de fuerza bruta, spam)
  //300 peticiones cada 15 minutos por IP; al superarlas responde 429 Too Many Requests
  const limitadorGeneral = rateLimit({
    windowMs: 15 * 60 * 1000, // ventana de tiempo: 15 minutos (en milisegundos)
    limit: 300, // máximo de peticiones permitidas en esa ventana
    standardHeaders: true, // expone las cabeceras estándar RateLimit-* en la respuesta
    legacyHeaders: false, // desactiva las cabeceras antiguas (X-RateLimit-*)
    message: { error: "Demasiadas peticiones, inténtalo de nuevo más tarde" }
  });
  app.use(limitadorGeneral);
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//rutas
app.set("view engine", ".hbs");

app.use(indexRoutes);
app.use(equipoRoutes);
app.use(usuarioRoutes);
app.use(habilidadRoutes);
app.use(proyectoRoutes);
app.use(recursoAprendizajeRoutes);
app.use(postulacionRoutes);
app.use(comentarioRoutes);
app.use(usuarioHabilidadRoutes);
app.use(proyectoHabilidadRoutes);
app.use(miembroEquipoRoutes);
app.use(solicitudEquipoRoutes);
app.use(mensajeEquipoRoutes);
app.use(notificacionRoutes);
app.use(statsRoutes);
app.use(logroRoutes);
app.use(ofertaRoutes);

//Manejo de errores (después de todas las rutas)
app.use(notFound);
app.use(errorHandlerMiddleware);

export default app; //Exporto el obj
