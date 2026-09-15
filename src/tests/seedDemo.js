import "dotenv/config";
import dns from "dns";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario";
import Habilidad from "../models/Habilidad";
import Proyecto from "../models/Proyecto";
import RecursoAprendizaje from "../models/RecursoAprendizaje";
import Oferta from "../models/Oferta";
import Equipo from "../models/Equipo";
import MiembroEquipo from "../models/MiembroEquipo";
import Logro from "../models/Logro";
import LogroUsuario from "../models/LogroUsuario";
import UsuarioHabilidad from "../models/UsuarioHabilidad";

const HABILIDADES = [
  {
    nombre: "Electrónica Básica",
    categoria: "Electrónica",
    descripcion: "Leyes de Ohm y Kirchhoff, componentes pasivos y activos, lectura de esquemas.",
    nivel_minimo: "principiante",
    tiempo_estimado: "40 h",
    etiquetas: ["electricidad", "componentes"]
  },
  {
    nombre: "Circuitos Electrónicos",
    categoria: "Electrónica",
    descripcion: "Diseño y análisis de circuitos analógicos y digitales.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "60 h",
    etiquetas: ["circuitos", "análisis"]
  },
  {
    nombre: "Programación Embebida (C/C++)",
    categoria: "Electrónica",
    descripcion: "Firmware para microcontroladores como AVR, PIC y STM32.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "80 h",
    etiquetas: ["firmware", "microcontroladores", "c"]
  },
  {
    nombre: "Prototipado con Arduino",
    categoria: "IoT",
    descripcion: "Sensores, actuadores y proyectos interactivos con Arduino.",
    nivel_minimo: "principiante",
    tiempo_estimado: "30 h",
    etiquetas: ["arduino", "sensores", "iot"]
  },
  {
    nombre: "Diseño de PCB",
    categoria: "Electrónica",
    descripcion: "Diseño de placas de circuito impreso con KiCad y Eagle.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "50 h",
    etiquetas: ["pcb", "kicad"]
  },
  {
    nombre: "Fundamentos de Redes",
    categoria: "Redes",
    descripcion: "Modelo OSI, TCP/IP, direccionamiento IP y topologías.",
    nivel_minimo: "principiante",
    tiempo_estimado: "35 h",
    etiquetas: ["osi", "tcp-ip", "ip"]
  },
  {
    nombre: "Configuración de Routers y Switches",
    categoria: "Redes",
    descripcion: "Configuración de equipos Cisco, VLANs, STP y enrutamiento.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "70 h",
    etiquetas: ["cisco", "vlan", "stp"]
  },
  {
    nombre: "Redes Inalámbricas",
    categoria: "Redes",
    descripcion: "Wi-Fi, diseño de puntos de acceso y resolución de interferencias.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "40 h",
    etiquetas: ["wifi", "access point"]
  },
  {
    nombre: "Ciberseguridad de Redes",
    categoria: "Ciberseguridad",
    descripcion: "Firewalls, IDS/IPS, segmentación y monitoreo de tráfico.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "65 h",
    etiquetas: ["firewall", "ids", "monitoreo"]
  },
  {
    nombre: "Seguridad Informática",
    categoria: "Ciberseguridad",
    descripcion: "Principios de seguridad, hardening y gestión de vulnerabilidades.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "55 h",
    etiquetas: ["hardening", "vulnerabilidades"]
  },
  {
    nombre: "Linux para Redes",
    categoria: "Sistemas Operativos",
    descripcion: "Administración de servidores Linux y herramientas de red.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "60 h",
    etiquetas: ["linux", "servidores"]
  },
  {
    nombre: "Pentesting y Hacking Ético",
    categoria: "Ciberseguridad",
    descripcion: "Análisis de vulnerabilidades, explotación ética y reportes de seguridad.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "70 h",
    etiquetas: ["pentest", "ethical hacking", "metasploit"]
  },
  {
    nombre: "Python para Automatización",
    categoria: "Sistemas Operativos",
    descripcion: "Scripts, automatización de tareas y control de instrumentos con Python.",
    nivel_minimo: "principiante",
    tiempo_estimado: "45 h",
    etiquetas: ["python", "scripts", "automatización"]
  },
  {
    nombre: "Arquitectura en la Nube",
    categoria: "Cloud",
    descripcion: "Fundamentos de AWS, Azure y diseño de infraestructura escalable.",
    nivel_minimo: "intermedio",
    tiempo_estimado: "55 h",
    etiquetas: ["aws", "azure", "cloud"]
  }
];

const RECURSOS = [
  {
    titulo: "Curso: Introducción a la Electrónica",
    descripcion: "Aprende desde cero los fundamentos de la electrónica con circuitos reales.",
    url: "https://www.coursera.org/learn/electronics",
    tipo: "curso",
    nivel: "principiante",
    habilidad: "Electrónica Básica"
  },
  {
    titulo: "Guía oficial de Arduino",
    descripcion: "Documentación oficial con ejemplos de montaje y código.",
    url: "https://docs.arduino.cc/",
    tipo: "documentación",
    nivel: "principiante",
    habilidad: "Prototipado con Arduino"
  },
  {
    titulo: "Video: Fundamentos de redes paso a paso",
    descripcion: "Serie de videos que explica el modelo OSI y TCP/IP con ejemplos.",
    url: "https://www.youtube.com/@powercert",
    tipo: "video",
    nivel: "principiante",
    habilidad: "Fundamentos de Redes"
  },
  {
    titulo: "Artículo: Diseña tu primer PCB en 5 pasos",
    descripcion: "Guía práctica para diseñar y mandar a fabricar tu primera placa.",
    url: "https://learn.sparkfun.com/tutorials/pcb-basics",
    tipo: "artículo",
    nivel: "intermedio",
    habilidad: "Diseño de PCB"
  },
  {
    titulo: "Libro: Redes de Computadoras (Tanenbaum)",
    descripcion: "Referencia clásica sobre redes de computadoras.",
    url: "https://www.pearson.com/store/p/computer-networks/GPROG_ASTD_ISBM9780136764052",
    tipo: "libro",
    nivel: "intermedio",
    habilidad: "Fundamentos de Redes"
  },
  {
    titulo: "Curso: Ciberseguridad en redes",
    descripcion: "Estrategias de defensa perimetral y monitoreo de red.",
    url: "https://www.cisco.com/site/us/en/learn/training-certifications/training/index.html",
    tipo: "curso",
    nivel: "intermedio",
    habilidad: "Ciberseguridad de Redes"
  },
  {
    titulo: "Documentación: Packet Tracer de Cisco",
    descripcion: "Simulador de redes para practicar topologías y configuración.",
    url: "https://www.netacad.com/courses/packet-tracer",
    tipo: "documentación",
    nivel: "principiante",
    habilidad: "Configuración de Routers y Switches"
  },
  {
    titulo: "Libro: Aprendiendo Arduino con proyectos",
    descripcion: "Proyectos guiados de sensores, motores y pantallas con Arduino.",
    url: "https://www.amazon.com/Learning-Arduino-Programming-Richard-Shelby/dp/1782167126",
    tipo: "libro",
    nivel: "principiante",
    habilidad: "Prototipado con Arduino"
  },
  {
    titulo: "Curso: Introducción al hacking ético",
    descripcion: "Laboratorios prácticos de pentesting en un entorno legal y educativo.",
    url: "https://tryhackme.com/",
    tipo: "curso",
    nivel: "intermedio",
    habilidad: "Pentesting y Hacking Ético"
  },
  {
    titulo: "Documentación: AWS Cloud Practitioner Essentials",
    descripcion: "Introducción certificable a los conceptos fundamentales de la nube AWS.",
    url: "https://aws.amazon.com/training/learn-about/cloud-practitioner/",
    tipo: "documentación",
    nivel: "principiante",
    habilidad: "Arquitectura en la Nube"
  },
  {
    titulo: "Video: Automatización con Python (serie)",
    descripcion: "Serie de videos para automatizar servidores e instrumentos con Python.",
    url: "https://www.youtube.com/@sentdex",
    tipo: "video",
    nivel: "principiante",
    habilidad: "Python para Automatización"
  },
  {
    titulo: "Curso: CCNA Introducción a Redes",
    descripcion: "Ruta oficial de Cisco Networking Academy para certificación CCNA.",
    url: "https://www.netacad.com/courses/ccna-introduction-networks",
    tipo: "curso",
    nivel: "intermedio",
    habilidad: "Configuración de Routers y Switches"
  },
  {
    titulo: "Libro: Hacking Ético y Pentesting",
    descripcion: "Manual práctico de metodologías, herramientas y reportes de seguridad.",
    url: "https://www.packtpub.com/en-us/product/ethical-hacking-and-penetration-testing-guide-9781837634503",
    tipo: "libro",
    nivel: "intermedio",
    habilidad: "Pentesting y Hacking Ético"
  }
];

const PROYECTOS = [
  {
    titulo: "Sistema de riego automatizado IoT",
    descripcion:
      "Plataforma que monitorea humedad del suelo y controla electroválvulas desde una app. Incluye sensores, placa ESP32 y panel de control web.",
    categoria: "IoT",
    nivel_dificultad: "intermedio",
    estado: "buscando_equipo",
    habilidades: [
      "Prototipado con Arduino",
      "Electrónica Básica",
      "Circuitos Electrónicos",
      "Programación Embebida (C/C++)"
    ],
    integrantes: 4,
    dias_limite: 90
  },
  {
    titulo: "Red LAN para laboratorio escolar",
    descripcion:
      "Diseño e implementación de una red local para un laboratorio de cómputo: cableado, switches VLAN y salida a Internet administrable.",
    categoria: "Redes",
    nivel_dificultad: "intermedio",
    estado: "buscando_equipo",
    habilidades: [
      "Fundamentos de Redes",
      "Configuración de Routers y Switches",
      "Redes Inalámbricas",
      "Linux para Redes"
    ],
    integrantes: 3,
    dias_limite: 75
  },
  {
    titulo: "Medidor de energía con ESP32",
    descripcion:
      "Dispositivo que registra consumo eléctrico en tiempo real, envía métricas a la nube y genera reportes de ahorro.",
    categoria: "Electrónica",
    nivel_dificultad: "avanzado",
    estado: "en_desarrollo",
    habilidades: ["Circuitos Electrónicos", "Diseño de PCB", "Programación Embebida (C/C++)"],
    integrantes: 3,
    dias_limite: 60
  },
  {
    titulo: "Seguridad perimetral de la red",
    descripcion:
      "Implementación de firewall, segmentación de red y monitoreo de tráfico para una pyme. Incluye política de acceso.",
    categoria: "Ciberseguridad",
    nivel_dificultad: "avanzado",
    estado: "buscando_equipo",
    habilidades: ["Ciberseguridad de Redes", "Seguridad Informática", "Fundamentos de Redes", "Linux para Redes"],
    integrantes: 4,
    dias_limite: 110
  },
  {
    titulo: "Amplificador de audio DIY",
    descripcion:
      "Amplificador de audio de clase AB de bajo costo para estaciones de escucha escolares. Documentación completa del esquemático.",
    categoria: "Electrónica",
    nivel_dificultad: "principiante",
    estado: "finalizado",
    habilidades: ["Electrónica Básica", "Circuitos Electrónicos"],
    integrantes: 2,
    dias_limite: 45
  },
  {
    titulo: "Segmentación de red con VLANs",
    descripcion:
      "Proyecto académico que separa departamentos con VLANs, aplica ACLs y valida el diseño con simulaciones.",
    categoria: "Redes",
    nivel_dificultad: "intermedio",
    estado: "en_desarrollo",
    habilidades: ["Configuración de Routers y Switches", "Fundamentos de Redes", "Ciberseguridad de Redes"],
    integrantes: 2,
    dias_limite: 50
  },
  {
    titulo: "Detección de intrusiones con IA",
    descripcion:
      "Sistema basado en machine learning que identifica patrones anómalos de tráfico y genera alertas en tiempo real.",
    categoria: "Ciberseguridad",
    nivel_dificultad: "avanzado",
    estado: "buscando_equipo",
    habilidades: ["Ciberseguridad de Redes", "Seguridad Informática", "Python para Automatización", "Linux para Redes"],
    integrantes: 4,
    dias_limite: 120
  },
  {
    titulo: "Automatización del hogar con Home Assistant",
    descripcion:
      "Hub doméstico con sensores de presencia, control de persianas y comandos de voz con Home Assistant.",
    categoria: "IoT",
    nivel_dificultad: "intermedio",
    estado: "en_desarrollo",
    habilidades: ["Prototipado con Arduino", "Programación Embebida (C/C++)", "Electrónica Básica", "Python para Automatización"],
    integrantes: 3,
    dias_limite: 80
  }
];

const OFERTAS = [
  {
    titulo: "Practicante de redes y soporte IT",
    empresa: "Telmex",
    descripcion:
      "Apoyar en mantenimiento de red, cableado estructurado y soporte técnico de primer nivel en oficinas centrales.",
    tipo: "practica",
    modalidad: "presencial",
    ubicacion: "CDMX, México",
    salario: "$8,000 MXN/mes",
    nivel: "principiante",
    habilidades: ["Fundamentos de Redes", "Linux para Redes", "Configuración de Routers y Switches"],
    estado: "abierta",
    dias_limite: 30
  },
  {
    titulo: "Técnico en mantenimiento electrónico",
    empresa: "Mabe",
    descripcion:
      "Diagnóstico y reparación de placas de control de electrodomésticos en planta. Se valora experiencia con multímetro y osciloscopio.",
    tipo: "empleo",
    modalidad: "presencial",
    ubicacion: "Guadalajara, México",
    salario: "$12,000 MXN/mes",
    nivel: "intermedio",
    habilidades: ["Electrónica Básica", "Circuitos Electrónicos", "Programación Embebida (C/C++)"],
    estado: "abierta",
    dias_limite: 25
  },
  {
    titulo: "Especialista en ciberseguridad junior",
    empresa: "Softtek",
    descripcion:
      "Monitoreo de seguridad, respuesta a incidentes y configuración de firewalls. Crecimiento a especialista senior.",
    tipo: "empleo",
    modalidad: "remoto",
    ubicacion: "Remoto (México)",
    salario: "$18,000 MXN/mes",
    nivel: "intermedio",
    habilidades: ["Ciberseguridad de Redes", "Seguridad Informática", "Linux para Redes"],
    estado: "abierta",
    dias_limite: 20
  },
  {
    titulo: "Voluntario para proyectos IoT comunitarios",
    empresa: "Fundación Construyendo",
    descripcion:
      "Diseñar prototipos de bajo costo para monitoreo de agua y energía en comunidades rurales.",
    tipo: "voluntariado",
    modalidad: "remoto",
    ubicacion: "Remoto",
    salario: "Voluntariado",
    nivel: "principiante",
    habilidades: ["Prototipado con Arduino", "Python para Automatización", "Electrónica Básica"],
    estado: "abierta",
    dias_limite: 40
  },
  {
    titulo: "Ingeniero de redes certificado CCNA",
    empresa: "Axtel",
    descripcion:
      "Diseño y operación de redes WAN/LAN para clientes empresariales. Certificación CCNA deseable.",
    tipo: "empleo",
    modalidad: "hibrido",
    ubicacion: "Monterrey, México",
    salario: "$25,000 MXN/mes",
    nivel: "avanzado",
    habilidades: ["Configuración de Routers y Switches", "Redes Inalámbricas", "Fundamentos de Redes"],
    estado: "abierta",
    dias_limite: 30
  }
];

const EQUIPOS = [
  {
    nombreEquipo: "Riego IoT",
    proyecto: "Sistema de riego automatizado IoT",
    descripcion: "Equipo encargado de sensores, firmware y la app de control."
  },
  {
    nombreEquipo: "Red Escolar",
    proyecto: "Red LAN para laboratorio escolar",
    descripcion: "Equipo de infraestructura y cableado estructurado."
  },
  {
    nombreEquipo: "Energía ESP32",
    proyecto: "Medidor de energía con ESP32",
    descripcion: "Hardware, firmware y analítica de consumo."
  },
  {
    nombreEquipo: "Ciber Defensa",
    proyecto: "Seguridad perimetral de la red",
    descripcion: "Especialistas en firewall y monitoreo."
  }
];

const habilidadesRegistradas = {};

//Cuentas que se autocompletan en el login (chips Estudiante / Admin)
const DEMO_USUARIOS = [
  {
    email: "admin@test.com",
    password: "12345678",
    nombre: "Admin",
    apellido_paterno: "Demo",
    apellido_materno: "Nexora",
    rol: "admin",
    telefono: "+52 555 123 4567",
    pais: "México",
    provincia: "CDMX",
    acerca_de_mi: "Cuenta de administración para pruebas de NexoraLabs.",
    nivel_experiencia: "experto",
    especialidad_principal: "Gestión de plataforma",
    disponibilidad: "tiempo_completo",
    intereses: ["Desarrollo Web", "Ciberseguridad", "DevOps"],
    idiomas: ["Español", "Inglés"],
    educacion: { institucion: "NexoraLabs", titulo: "Administración de plataforma", en_curso: false },
    redes_sociales: { github: "https://github.com/", linkedin: "https://linkedin.com/", portafolio: "" }
  },
  {
    email: "joshua@test.com",
    password: "123456",
    nombre: "Joshua",
    apellido_paterno: "Test",
    apellido_materno: "Estudiante",
    rol: "estudiante",
    telefono: "+52 555 987 6543",
    pais: "México",
    provincia: "Jalisco",
    acerca_de_mi: "Estudiante de electrónica interesado en IoT y redes. Me encanta prototipar con Arduino.",
    nivel_experiencia: "intermedio",
    especialidad_principal: "IoT",
    disponibilidad: "medio_tiempo",
    intereses: ["IoT", "Robótica", "Ciberseguridad"],
    idiomas: ["Español", "Inglés"],
    educacion: { institucion: "Universidad de Guadalajara", titulo: "Ingeniería en Electrónica", en_curso: true },
    redes_sociales: { github: "https://github.com/joshua", linkedin: "https://linkedin.com/in/joshua", portafolio: "" }
  }
];

//Logros del catálogo (recompensas que se otorgan en la plataforma)
const LOGROS = [
  {
    clave: "primer-proyecto",
    nombre: "Primer proyecto",
    descripcion: "Creaste tu primer proyecto en NexoraLabs.",
    icono: "🚀",
    tipo: "crear_proyecto",
    cantidad: 1
  },
  {
    clave: "perfil-completo",
    nombre: "Perfil completo",
    descripcion: "Completaste tu perfil al 100%.",
    icono: "🎯",
    tipo: "completar_perfil",
    cantidad: 1
  },
  {
    clave: "primer-postulacion",
    nombre: "Primera postulación",
    descripcion: "Te postulaste a un proyecto por primera vez.",
    icono: "📬",
    tipo: "postularse",
    cantidad: 1
  },
  {
    clave: "constante",
    nombre: "Constante",
    descripcion: "Te postulaste a 5 proyectos.",
    icono: "⭐",
    tipo: "postularse",
    cantidad: 5
  },
  {
    clave: "equipo-activo",
    nombre: "En equipo",
    descripcion: "Te uniste a tu primer equipo de trabajo.",
    icono: "🤝",
    tipo: "unirse_equipo",
    cantidad: 1
  },
  {
    clave: "participativo",
    nombre: "Participativo",
    descripcion: "Dejaste 10 comentarios en proyectos.",
    icono: "💬",
    tipo: "comentar",
    cantidad: 10
  },
  {
    clave: "recurso-util",
    nombre: "Buscador de recursos",
    descripcion: "Calificaste 3 recursos de aprendizaje.",
    icono: "📚",
    tipo: "calificar_recurso",
    cantidad: 3
  }
];

const upsertDemoUsuario = async (demo) => {
  const existente = await Usuario.findOne({ email: demo.email });
  if (existente) {
    await Usuario.updateOne({ _id: existente._id }, { $set: { email_verificado: true, rol: demo.rol } });
    return existente;
  }
  const { password, ...datos } = demo;
  const usuario = new Usuario({
    ...datos,
    password: await bcrypt.hash(password, 10),
    email_verificado: true
  });
  await usuario.save();
  return usuario;
};

const upsertSkill = async (s) => {
  await Habilidad.updateOne({ nombre: s.nombre }, { $set: s }, { upsert: true, setDefaultsOnInsert: true });
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
    fecha_limite: new Date(Date.now() + p.dias_limite * 86400000)
  };
  await Proyecto.updateOne(
    { creador_id: admin._id, titulo: p.titulo },
    { $set: { ...base, habilidades_requeridas: idsHabilidades } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return Proyecto.findOne({ creador_id: admin._id, titulo: p.titulo });
};

const main = async () => {
  //Con Atlas hay que forzar DNS públicos para resolver los registros SRV
  if (process.env.MONGO_URI?.startsWith("mongodb+srv://")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const demos = {};
  for (const demo of DEMO_USUARIOS) {
    demos[demo.rol] = await upsertDemoUsuario(demo);
  }

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

  //Catálogo de logros + asignación a la cuenta demo de estudiante
  const logrosRegistrados = {};
  for (const l of LOGROS) {
    const previo = await Logro.countDocuments({ clave: l.clave });
    await Logro.updateOne({ clave: l.clave }, { $set: l }, { upsert: true, setDefaultsOnInsert: true });
    logrosRegistrados[l.clave] = (await Logro.findOne({ clave: l.clave }))._id;
    if (previo === 0) creadas += 1;
  }

  const estudiante = await Usuario.findOne({ rol: "estudiante", email: "joshua@test.com" });
  const estudianteId = estudiante?._id || demos.estudiante?._id;
  if (estudianteId) {
    const logrosDemo = LOGROS.filter((l) => ["primer-proyecto", "perfil-completo", "primer-postulacion", "equipo-activo"].includes(l.clave));
    for (const l of logrosDemo) {
      const id = logrosRegistrados[l.clave];
      const previo = await LogroUsuario.countDocuments({ usuario_id: estudianteId, logro_id: id });
      if (previo === 0) {
        creadas += 1;
        await LogroUsuario.create({ usuario_id: estudianteId, logro_id: id, fecha_obtencion: new Date() });
      }
    }

    const habilidadesEstudiante = ["Electrónica Básica", "Prototipado con Arduino", "Fundamentos de Redes"];
    for (const nombre of habilidadesEstudiante) {
      const h = habilidadesRegistradas[nombre];
      if (!h) continue;
      const previo = await UsuarioHabilidad.countDocuments({ usuario_id: estudianteId, habilidad_id: h });
      if (previo === 0) {
        creadas += 1;
        await UsuarioHabilidad.create({ usuario_id: estudianteId, habilidad_id: h, nivel: "intermedio", años_experiencia: 2 });
      }
    }
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
      {
        $set: { ...r, habilidad_id: habilidadesRegistradas[r.habilidad] },
        $addToSet: { recomendado_por: admin._id }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  for (const o of OFERTAS) {
    const { dias_limite, habilidades, ...datos } = o;
    const idsHabilidades = habilidades.map((n) => habilidadesRegistradas[n]?.toString()).filter(Boolean);
    const previo = await Oferta.countDocuments({ publicado_por: admin._id, titulo: o.titulo });
    await Oferta.updateOne(
      { publicado_por: admin._id, titulo: o.titulo },
      {
        $set: {
          ...datos,
          habilidades_requeridas: idsHabilidades,
          fecha_limite: new Date(Date.now() + dias_limite * 86400000)
        }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    if (previo === 0) creadas += 1;
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
    usuarios: await Usuario.countDocuments(),
    habilidades: await Habilidad.countDocuments(),
    proyectos: await Proyecto.countDocuments(),
    recursos: await RecursoAprendizaje.countDocuments(),
    equipos: await Equipo.countDocuments(),
    miembros: await MiembroEquipo.countDocuments(),
    ofertas: await Oferta.countDocuments(),
    logros: await Logro.countDocuments(),
    logros_usuarios: await LogroUsuario.countDocuments(),
    habilidades_usuarios: await UsuarioHabilidad.countDocuments()
  };

  console.log(`[seedDemo] admin: ${admin.nombre} <${admin.email}> (${admin._id})`);
  const demoEstudiante = await Usuario.findOne({ rol: "estudiante", email: "joshua@test.com" });
  console.log(`[seedDemo] estudiante demo: ${demoEstudiante?.nombre} <${demoEstudiante?.email}>`);
  console.log(`[seedDemo] registros nuevos: ${creadas}`);
  console.log(`[seedDemo] totales en BD:`, totales);

  await mongoose.disconnect();
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seedDemo] error:", err);
    process.exit(1);
  });
