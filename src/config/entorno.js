const esProduccion = process.env.NODE_ENV === "production";
const esTest = process.env.NODE_ENV === "test";

export function validarEntorno() {
    if (esTest) return;

    const puerto = Number(process.env.PORT || 3000);
    if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
        throw new Error(`Variable PORT inválida: "${process.env.PORT}"`);
    }

    if (esProduccion) {
        const obligatorias = ["MONGO_URI", "JWT_SECRET", "CORS_ORIGINS"];
        const faltan = obligatorias.filter((clave) => !process.env[clave]);
        if (faltan.length > 0) {
            throw new Error(
                `Faltan variables obligatorias en producción: ${faltan.join(", ")}`
            );
        }
    }
}

export function origenesPermitidos() {
    return (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}