import express from "express";
import morgan from "morgan";
import indexRoutes from './routes/indexRoutes';
import equipoRoutes from './routes/Equipo.routes';
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

export default app; //Exporto el obj