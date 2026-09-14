import CorreoValidacion from "../models/CorreoValidacion";

const URL_ABSTRACT = "https://emailvalidation.abstractapi.com/v1/";
const TIEMPO_VALIDEZ_CACHE = 30 * 24 * 60 * 60 * 1000; // 30 días para no gastar el cupo del plan gratuito
const TIMEOUT_MILIS = 8000;
// Correos del entorno o de demostración: no se consultan servicios externos
const DOMINIOS_DEMO = new Set(["test.com", "example.com"]);

export const esFormatoValido = (email) => /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email);

export const normalizarCorreo = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

async function consultarAbstract(email) {
  const clave = process.env.ABSTRACT_API_KEY;
  if (!clave) throw new Error("Sin ABSTRACT_API_KEY configurada");

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MILIS);
  try {
    const url = `${URL_ABSTRACT}?api_key=${encodeURIComponent(clave)}&email=${encodeURIComponent(email)}&auto_correct=false`;
    const respuesta = await fetch(url, { signal: controlador.signal });
    if (!respuesta.ok) throw new Error(`Abstract respondió ${respuesta.status}`);
    return await respuesta.json();
  } finally {
    clearTimeout(temporizador);
  }
}

const resumenDesdeAbstract = (datos) => {
  const deliverability = String(datos?.deliverability || "").toUpperCase();
  const disposable = Boolean(datos?.is_disposable_email?.value);
  const catchall = Boolean(datos?.is_catchall_email?.value);
  const rol = Boolean(datos?.is_role_account?.value);
  const brechas = Number.isInteger(datos?.breach?.count) ? datos.breach.count : null;

  let estado;
  if (deliverability === "UNDELIVERABLE") estado = "invalido";
  else if (disposable) estado = "desechable";
  else if (deliverability === "RISKY") estado = "riesgoso";
  else if (deliverability === "DELIVERABLE") estado = "valido";
  else estado = "indeterminado";

  return {
    estado,
    deliverability,
    detalle: { disposable, catchall, rol, brechas }
  };
};

//Devuelve un resumen de si el correo es válido/existente. Nunca lanza error:
//si la API falla o no está configurada, responde "indeterminado" sin romper el flujo.
export const validarCorreo = async (emailEntrada) => {
  const email = normalizarCorreo(emailEntrada);

  if (!esFormatoValido(email)) {
    return { email, estado: "invalido", motivo: "formato", detector: "local", revisado: new Date(), detalle: null };
  }

  if (DOMINIOS_DEMO.has(email.split("@")[1])) {
    return { email, estado: "valido", motivo: "demo", detector: "local", revisado: new Date(), detalle: null };
  }

  try {
    const cache = await CorreoValidacion.findOne({ email });
    if (cache && Date.now() - new Date(cache.fecha).getTime() < TIEMPO_VALIDEZ_CACHE) {
      return {
        email,
        estado: cache.estado,
        motivo: "cache",
        detector: "abstract",
        revisado: cache.fecha,
        detalle: cache.detalle,
        deliverability: cache.deliverability || null
      };
    }

    //En modo test no se llaman servicios externos
    if (process.env.NODE_ENV === "test") {
      return { email, estado: "indeterminado", motivo: "test", detector: "local", revisado: new Date(), detalle: null };
    }

    const datos = await consultarAbstract(email);
    const resumen = resumenDesdeAbstract(datos);
    await CorreoValidacion.findOneAndUpdate(
      { email },
      {
        email,
        estado: resumen.estado,
        deliverability: resumen.deliverability,
        detalle: resumen.detalle,
        fecha: new Date()
      },
      { upsert: true }
    );

    return {
      email,
      estado: resumen.estado,
      motivo: "abstract",
      detector: "abstract",
      revisado: new Date(),
      detalle: resumen.detalle,
      deliverability: resumen.deliverability
    };
  } catch (error) {
    console.log("No se pudo validar el correo:", error.message);
    return { email, estado: "indeterminado", motivo: "error", detector: "local", revisado: new Date(), detalle: null };
  }
};
