import "dotenv/config";
import mongoose from "mongoose";
import Usuario from "../models/Usuario";
import Habilidad from "../models/Habilidad";
import Proyecto from "../models/Proyecto";
import RecursoAprendizaje from "../models/RecursoAprendizaje";
import Equipo from "../models/Equipo";
import MiembroEquipo from "../models/MiembroEquipo";

const HABILIDADES = [
  { nombre: "Electrónica Básica", categoria: "Electrónica", descripcion: "Leyes de Ohm y Kirchhoff, componentes pasivos y activos, lectura de esquemas.", nivel_minimo: "principiante", tiempo_estimado: "40 h", etiquetas: ["electricidad", "componentes"] },
  { nombre: "Circuitos Electrónicos", categoria: "Electrónica", descripcion: "Diseño y análisis de circuitos analógicos y digitales.", nivel_minimo: "intermedio", tiempo_estimado: "60 h", etiquetas: ["circuitos", "análisis"] },
  { nombre: "Programación Embebida (C/C++)", categoria: "Electrónica", descripcion: "Firmware para microcontroladores como AVR, PIC y STM32.", nivel_minimo: "intermedio", tiempo_estimado: "80 h", etiquetas: ["firmware", "microcontroladores", "c"] },
  { nombre: "Prototipado con Arduino", categoria: "IoT", descripcion: "Sensores, actuadores y proyectos interactivos con Arduino.", nivel_minimo: "principiante", tiempo_estimado: "30 h", etiquetas: ["arduino", "sensores", "iot"] },
  { nombre: "Diseño de PCB", categoria: "Electrónica", descripcion: "Diseño de placas de circuito impreso con KiCad y Eagle.", nivel_minimo: "intermedio", tiempo_estimado: "50 h", etiquetas: ["pcb", "kicad"] },
  { nombre: "Fundamentos de Redes", categoria: "Redes", descripcion: "Modelo OSI, TCP/IP, direccionamiento IP y topologías.", nivel_minimo: "principiante", tiempo_estimado: "35 h", etiquetas: ["osi", "tcp-ip", "ip"] },
  { nombre: "Configuración de Routers y Switches", categoria: "Redes", descripcion: "Configuración de equipos Cisco, VLANs, STP y enrutamiento.", nivel_minimo: "intermedio", tiempo_estimado: "70 h", etiquetas: ["cisco", "vlan", "stp"] },
  { nombre: "Redes Inalámbricas", categoria: "Redes", descripcion: "Wi-Fi, diseño de puntos de acceso y resolución de interferencias.", nivel_minimo: "intermedio", tiempo_estimado: "40 h", etiquetas: ["wifi", "access point"] },
  { nombre: "Ciberseguridad de Redes", categoria: "Ciberseguridad", descripcion: "Firewalls, IDS/IPS, segmentación y monitoreo de tráfico.", nivel_minimo: "intermedio", tiempo_estimado: "65 h", etiquetas: ["firewall", "ids", "monitoreo"] },
  { nombre: "Seguridad Informática", categoria: "Ciberseguridad", descripcion: "Principios de seguridad, hardening y gestión de vulnerabilidades.", nivel_minimo: "intermedio", tiempo_estimado: "55 h", etiquetas: ["hardening", "vulnerabilidades"] },
  { nombre: "Linux para Redes", categoria: "Sistemas Operativos", descripcion: "Administración de servidores Linux y herramientas de red.", nivel_minimo: "intermedio", tiempo_estimado: "60 h", etiquetas: ["linux", "servidores"] },
];

const RECURSOS = [
  { titulo: "Curso: Introducción a la Electrónica", descripcion: "Aprende desde cero los fundamentos de la electrónica con circuitos reales.", url: "https://www.coursera.org/learn/electronics", tipo: "curso", nivel: "principiante", habilidad: "Electrónica Básica" },
  { titulo: "Guía oficial de Arduino", descripcion: "Documentación oficial con ejemplos de montaje y código.", url: "https://docs.arduino.cc/", tipo: "documentación", nivel: "principiante", habilidad: "Prototipado con Arduino" },
  { titulo: "Video: Fundamentos de redes paso a paso", descripcion: "Serie de videos que explica el modelo OSI y TCP/IP con ejemplos.", url: "https://www.youtube.com/@powercert", tipo: "video", nivel: "principiante", habilidad: "Fundamentos de Redes" },
  { titulo: "Artículo: Diseña tu primer PCB en 5 pasos", descripcion: "Guía práctica para diseñar y mandar a fabricar tu primera placa.", url: "https://learn.sparkfun.com/tutorials/pcb-basics", tipo: "artículo", nivel: "intermedio", habilidad: "Diseño de PCB" },
  { titulo: "Libro: Redes de Computadoras (Tanenbaum)", descripcion: "Referencia clásica sobre redes de computadoras.", url: "https://www.pearson.com/store/p/computer-networks/GPROG_ASTD_ISBM9780136764052", tipo: "libro", nivel: "intermedio", habilidad: "Fundamentos de Redes" },
  { titulo: "Curso: Ciberseguridad en redes", descripcion: "Estrategias de defensa perimetral y monitoreo de red.", url: "https://www.cisco.com/site/us/en/learn/training-certifications/training/index.html", tipo: "curso", nivel: "intermedio", habilidad: "Ciberseguridad de Redes" },
  { titulo: "Documentación: Packet Tracer de Cisco", descripcion: "Simulador de redes para practicar topologías y configuración.", url: "https://www.netacad.com/courses/packet-tracer", tipo: "documentación", nivel: "principiante", habilidad: "Configuración de Routers y Switches" },
  { titulo: "Libro: Aprendiendo Arduino con proyectos", descripcion: "Proyectos guiados de sensores, motores y pantallas con Arduino.", url: "https://www.amazon.com/Learning-Arduino-Programming-Richard-Shelby/dp/1782167126", tipo: "libro", nivel: "principiante", habilidad: "Prototipado con Arduino" },
];

const PROYECTOS = [
  {
    titulo: "Sistema de riego automatizado IoT",
    descripcion: "Plataforma que monitorea humedad del suelo y controla electroválvulas desde una app. Incluye sensores, placa ESP32 y panel de control web.",
    categoria: "IoT",
    nivel_dificultad: "intermedio",
    estado: "buscando_equipo",
    habilidades: ["Prototipado con Arduino", "Electrónica Básica", "Circuitos Electrónicos", "Programación Embebida (C/C++)"],
    integrantes: 4,
    dias_limite: 90,
  },
  {
    titulo: "Red LAN para laboratorio escolar",
    descripcion: "Diseño e implementación de una red local para un laboratorio de cómputo: cableado, switches VLAN y salida a Internet administrable.",
    categoria: "Redes",
    nivel_dificultad: "intermedio",
    estado: "buscando_equipo",
    habilidades: ["Fundamentos de Redes", "Configuración de Routers y Switches", "Redes Inalámbricas", "Linux para Redes"],
    integrantes: 3,
    dias_limite: 75,
  },
  {
    titulo: "Medidor de energía con ESP32",
    descripcion: "Dispositivo que registra consumo eléctrico en tiempo real, envía métricas a la nube y genera reportes de ahorro.",
    categoria: "Electrónica",
    nivel_dificultad: "avanzado",
    estado: "en_desarrollo",
    habilidades: ["Circuitos Electrónicos", "Diseño de PCB", "Programación Embebida (C/C++)"],
    integrantes: 3,
    dias_limite: 60,
  },
  {
    titulo: "Seguridad perimetral de la red",
    descripcion: "Implementación de firewall, segmentación de red y monitoreo de tráfico para una pyme. Incluye política de acceso.",
    categoria: "Ciberseguridad",
    nivel_dificultad: "avanzado",
    estado: "buscando_equipo",
    habilidades: ["Ciberseguridad de Redes", "Seguridad Informática", "Fundamentos de Redes", "Linux para Redes"],
    integrantes: 4,
    dias_limite: 110,
  },
  {
    titulo: "Amplificador de audio DIY",
    descripcion: "Amplificador de audio de clase AB de bajo costo para estaciones de escucha escolares. Documentación completa del esquemático.",
    categoria: "Electrónica",
    nivel_dificultad: "principiante",
    estado: "finalizado",
    habilidades: ["Electrónica Básica", "Circuitos Electrónicos"],
    integrantes: 2,
    dias_limite: 45,
  },
  {
    titulo: "Segmentación de red con VLANs",
    descripcion: "Proyecto académico que separa departamentos con VLANs, aplica ACLs y valida el diseño con simulaciones.",
    categoria: "Redes",
    nivel_dificultad: "intermedio",
    estado: "en_desarrollo",
    habilidades: ["Configuración de Routers y Switches", "Fundamentos de Redes", "Ciberseguridad de Redes"],
    integrantes: 2,
    dias_limite: 50,
  },
];

const EQUIPOS = [
  { nombreEquipo: "Riego IoT", proyecto: "Sistema de riego automatizado IoT", descripcion: "Equipo encargado de sensores, firmware y la app de control." },
  { nombreEquipo: "Red Escolar", proyecto: "Red LAN para laboratorio escolar", descripcion: "Equipo de infraestructura y cableado estructurado." },
  { nombreEquipo: "Energía ESP32", proyecto: "Medidor de energía con ESP32", descripcion: "Hardware, firmware y analítica de consumo." },
  { nombreEquipo: "Ciber Defensa", proyecto: "Seguridad perimetral de la red", descripcion: "Especialistas en firewall y monitoreo." },
];

const habilidadesRegistradas = {};

const upsertSkill = async (s) => {
  await Habilidad.updateOne(
    { nombre: s.nombre },
    { $set: s },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return Habilidad.findOne({ nombre: s.nombre });
};

const upsertProyecto = async (admin, p) => {
  const idsHabilidades = p.habilidades.map((n) => habilidadesRegistradas[n]?.toString()).filter(Boolean);
  const base = {
    creador_id: admin._id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    categoria: p.categoria,
    nivel_dificultad: p.nivel_dificultad,
    estado: p.estado,
    integrantes_maximos: p.integrantes,
    fecha_limite: new Date(Date.now() + p.dias_limite * 86400000),
  };
  await Proyecto.updateOne(
    { creador_id: admin._id, titulo: p.titulo },
    { $set: { ...base, habilidades_requeridas: idsHabilidades } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return Proyecto.findOne({ creador_id: admin._id, titulo: p.titulo });
};

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await Usuario.findOne({ rol: "admin" });
  if (!admin) throw new Error("No se encontró un usuario con rol admin en la base de datos.");
  if (admin.email_verificado !== true) {
    await Usuario.updateOne({ _id: admin._id }, { $set: { email_verificado: true } });
  }

  let creadas = 0;
  for (const s of HABILIDADES) {
    const previo = await Habilidad.countDocuments({ nombre: s.nombre });
    const h = await upsertSkill(s);
    habilidadesRegistradas[s.nombre] = h._id;
    if (previo === 0) creadas += 1;
  }

  const proyectos = {};
  for (const p of PROYECTOS) {
    const previo = await Proyecto.countDocuments({ creador_id: admin._id, titulo: p.titulo });
    const proy = await upsertProyecto(admin, p);
    if (previo === 0) creadas += 1;
    proyectos[p.titulo] = proy;
  }

  for (const r of RECURSOS) {
    const previo = await RecursoAprendizaje.countDocuments({ titulo: r.titulo });
    if (previo === 0) creadas += 1;
    await RecursoAprendizaje.updateOne(
      { titulo: r.titulo },
      { $set: { ...r, habilidad_id: habilidadesRegistradas[r.habilidad] } },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  for (const e of EQUIPOS) {
    const proy = proyectos[e.proyecto];
    if (!proy) continue;
    const previoEquipo = await Equipo.countDocuments({ proyecto_id: proy._id });
    if (previoEquipo === 0) creadas += 1;
    await Equipo.updateOne(
      { proyecto_id: proy._id },
      { $set: { nombre: e.nombreEquipo, descripcion: e.descripcion } },
      { upsert: true, setDefaultsOnInsert: true }
    );
    const equipoActual = await Equipo.findOne({ proyecto_id: proy._id });
    const previoMiembro = await MiembroEquipo.countDocuments({ equipo_id: equipoActual._id, usuario_id: admin._id });
    if (previoMiembro === 0) {
      creadas += 1;
      await MiembroEquipo.updateOne(
        { equipo_id: equipoActual._id, usuario_id: admin._id },
        { $set: { rol: "lider" } },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }

  const totales = {
    habilidades: await Habilidad.countDocuments(),
    proyectos: await Proyecto.countDocuments(),
    recursos: await RecursoAprendizaje.countDocuments(),
    equipos: await Equipo.countDocuments(),
    miembros: await MiembroEquipo.countDocuments(),
  };

  console.log(`[seedDemo] admin: ${admin.nombre} <${admin.email}> (${admin._id})`);
  console.log(`[seedDemo] registros nuevos: ${creadas}`);
  console.log(`[seedDemo] totales en BD:`, totales);

  await mongoose.disconnect();
};

main().then(() => process.exit(0)).catch((err) => {
  console.error("[seedDemo] error:", err);
  process.exit(1);
});