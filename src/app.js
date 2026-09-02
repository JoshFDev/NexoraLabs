import express from "express";
import morgan from "morgan";
import indexRoutes from './routes/indexRoutes';
import equipoRoutes from './routes/equipo.routes';
import usuarioRoutes from './routes/usuario.routes'
import proyectoRoutes from './routes/proyecto.routes';
import habilidadRoutes from './routes/habilidad.routes';
import recursoAprendizajeRoutes from './routes/recursoAprendizaje.routes';
import postulacionRoutes from './routes/postulacion.routes';
import usuarioHabilidadRoutes from './routes/usuarioHabilidad.routes';
import proyectoHabilidadRoutes from './routes/proyectoHabilidad.routes';
import exphbs from "express-handlebars";
import path from "path";

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
app.use(morgan('dev'));
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

export default app; //Exporto el obj