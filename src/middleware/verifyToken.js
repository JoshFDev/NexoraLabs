import jwt from "jsonwebtoken";

export default (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Acceso denegado, no hay token" });
    }

    try {
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token no válido" });
    }
};