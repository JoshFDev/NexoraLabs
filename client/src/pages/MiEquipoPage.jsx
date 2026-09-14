import { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';
import { leerUsuario } from '../utils/perfil';
import './ProyectosPage.css';
import './MiEquipoPage.css';

const ETIQUETAS_ESTADO_EQUIPO = {
  activo: 'Activo',
  finalizado: 'Finalizado',
  disuelto: 'Disuelto'
};

const ROL_EQUIPO_LABEL = {
  lider: 'Líder',
  colaborador: 'Colaborador',
  miembro: 'Miembro'
};

const HERRAMIENTAS = [
  {
    icono: 'task_alt',
    nombre: 'Jira',
    descripcion: 'Organiza tareas, historias y sprints del equipo.',
    url: 'https://www.atlassian.com/software/jira'
  },
  {
    icono: 'view_kanban',
    nombre: 'Trello',
    descripcion: 'Tableros ágiles para planificar el proyecto.',
    url: 'https://trello.com'
  },
  {
    icono: 'note_add',
    nombre: 'Notion',
    descripcion: 'Documentación, notas y wikis del equipo.',
    url: 'https://www.notion.so'
  },
  {
    icono: 'forum',
    nombre: 'Slack',
    descripcion: 'Mensajería para coordinarse entre integrantes.',
    url: 'https://slack.com'
  },
  {
    icono: 'chat',
    nombre: 'Discord',
    descripcion: 'Canales de texto y voz para el equipo.',
    url: 'https://discord.com'
  },
  {
    icono: 'code',
    nombre: 'GitHub',
    descripcion: 'Repositorio, ramas y revisión de código.',
    url: 'https://github.com'
  },
  {
    icono: 'account_tree',
    nombre: 'GitLab',
    descripcion: 'Repos, CI/CD y planificación de tareas.',
    url: 'https://gitlab.com'
  },
  {
    icono: 'design_services',
    nombre: 'Figma',
    descripcion: 'Prototipos y diseño colaborativo.',
    url: 'https://www.figma.com'
  },
  {
    icono: 'folder_shared',
    nombre: 'Google Drive',
    descripcion: 'Almacena y comparte los archivos del equipo.',
    url: 'https://drive.google.com'
  },
  { icono: 'videocam', nombre: 'Zoom', descripcion: 'Videollamadas y reuniones del equipo.', url: 'https://zoom.us' }
];

function MiEquipoPage() {
  const usuario = leerUsuario();

  const [equipos, setEquipos] = useState(null);
  const [activoId, setActivoId] = useState(null);
  const [miembros, setMiembros] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  const chatRef = useRef(null);
  const avisoTimer = useRef(null);

  const equipoActivo = equipos?.find((e) => String(e._id) === String(activoId)) || null;

  const cargarMensajes = useCallback(() => {
    if (!activoId) return;
    api
      .get(`/equipo/${activoId}/mensajes`)
      .then((res) => setMensajes(res.data || []))
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar el chat'));
  }, [activoId]);

  useEffect(() => {
    api
      .get('/mis-equipos')
      .then((res) => {
        const datos = res.data || [];
        setEquipos(datos);
        if (datos.length > 0) {
          const preferido = datos.find((e) => e.rol === 'lider') || datos[0];
          setActivoId(String(preferido._id));
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Error al cargar tus equipos');
        setEquipos([]);
      });
  }, []);

  useEffect(() => {
    if (!activoId) return;
    setMiembros(null);
    setError('');
    api
      .get(`/equipo/${activoId}/miembros`)
      .then((res) => setMiembros(res.data || []))
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar los integrantes'));
    cargarMensajes();
  }, [activoId, cargarMensajes]);

  //Refresco periódico del chat para ver mensajes de los demás
  useEffect(() => {
    if (!activoId) return;
    const intervalo = setInterval(cargarMensajes, 5000);
    return () => clearInterval(intervalo);
  }, [activoId, cargarMensajes]);

  useEffect(() => {
    const contenedor = chatRef.current;
    if (contenedor) contenedor.scrollTop = contenedor.scrollHeight;
  }, [mensajes]);

  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  const mostrarAviso = (texto) => {
    setAviso(texto);
    if (avisoTimer.current) clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(''), 4000);
  };

  const alternarSilencio = async () => {
    if (!equipoActivo) return;
    const objetivo = !equipoActivo.silenciado;
    setError('');
    try {
      const res = await api.put(`/equipo/${activoId}/silenciar`, { silenciado: objetivo });
      setEquipos((prev) =>
        prev.map((e) => (String(e._id) === String(activoId) ? { ...e, silenciado: res.data.silenciado } : e))
      );
      mostrarAviso(
        res.data.silenciado
          ? `Chat de "${equipoActivo.nombre}" silenciado: no recibirás sus notificaciones.`
          : `Notificaciones del chat "${equipoActivo.nombre}" reactivadas.`
      );
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar el estado del grupo');
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido || !activoId) return;
    setEnviando(true);
    setError('');
    try {
      const res = await api.post(`/equipo/${activoId}/mensajes`, { contenido });
      setTexto('');
      setMensajes((prev) => [...prev, res.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const inicial = (m) => (m.usuario_id?.nombre || 'U').charAt(0).toUpperCase();

  if (equipos === null) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="secondary" />
        <p className="proyectos-subtitulo mt-2">Cargando tu equipo…</p>
      </Container>
    );
  }

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5 mb-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
          <h2 className="proyectos-titulo mb-0">Mi equipo</h2>
          <Button variant="outline-light" className="proyectos-boton" as={Link} to="/equipos">
            Ver todos los equipos
          </Button>
        </div>
        <p className="proyectos-subtitulo mb-4">Tu espacio de trabajo: integrantes, chat y herramientas.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        {aviso && <Alert variant="success">{aviso}</Alert>}

        {equipos.length === 0 ? (
          <div className="dash-vacio">
            <span className="dash-vacio-icono">
              <span className="material-symbols-outlined">groups</span>
            </span>
            <p>Aún no formas parte de ningún equipo. Explora los equipos activos y solicita unirte.</p>
            <Button size="sm" className="proyectos-boton" as={Link} to="/equipos">
              Ir a equipos
            </Button>
          </div>
        ) : (
          <>
            {equipos.length > 1 && (
              <div className="mi-equipo-tabs mb-3">
                {equipos.map((e) => (
                  <button
                    key={String(e._id)}
                    type="button"
                    className={`mi-equipo-tab${String(e._id) === activoId ? ' activo' : ''}`}
                    onClick={() => setActivoId(String(e._id))}
                  >
                    <span>{e.nombre}</span>
                    {e.rol === 'lider' && <small>· organizas</small>}
                  </button>
                ))}
              </div>
            )}

            {equipoActivo && (
              <>
                <section className="mi-equipo-cabecera mb-4">
                  <div>
                    <h3 className="proyecto-titulo-tarjeta mb-1">{equipoActivo.nombre}</h3>
                    <div className="proyecto-meta mb-2">
                      <span className="proyecto-badge">
                        {ETIQUETAS_ESTADO_EQUIPO[equipoActivo.estado] || equipoActivo.estado}
                      </span>
                      <span className="proyecto-badge">{ROL_EQUIPO_LABEL[equipoActivo.rol] || equipoActivo.rol}</span>
                      <span className="proyecto-badge">{equipoActivo.n_miembros || 0} integrante(s)</span>
                      {equipoActivo.proyecto_id?.titulo && (
                        <span className="proyecto-badge">Proyecto: {equipoActivo.proyecto_id.titulo}</span>
                      )}
                    </div>
                    {equipoActivo.descripcion && (
                      <p className="proyecto-descripcion mb-0">{equipoActivo.descripcion}</p>
                    )}
                  </div>
                  {equipoActivo.proyecto_id?._id && (
                    <Button className="proyectos-boton" as={Link} to={`/proyecto/${equipoActivo.proyecto_id._id}`}>
                      Ver el proyecto
                    </Button>
                  )}
                </section>

                <Row className="g-4">
                  <Col xl={4}>
                    <section className="dash-seccion h-100">
                      <div className="dash-seccion-cabecera">
                        <h3 className="proyectos-titulo mb-0" style={{ fontSize: '1.1rem' }}>
                          Integrantes
                        </h3>
                        <span className="proyectos-subtitulo" style={{ fontSize: '0.82rem' }}>
                          {miembros?.length ?? '—'} en el equipo
                        </span>
                      </div>
                      <div className="mi-equipo-miembros">
                        {miembros === null ? (
                          <div className="text-center py-3">
                            <Spinner animation="border" size="sm" variant="secondary" />
                          </div>
                        ) : miembros.length === 0 ? (
                          <p className="proyectos-subtitulo mb-0">Sin integrantes todavía.</p>
                        ) : (
                          miembros.map((m) => (
                            <div className="mi-equipo-miembro" key={String(m._id)}>
                              <span className="mi-equipo-miembro-avatar">
                                {m.usuario_id?.foto ? <img src={m.usuario_id.foto} alt="" /> : inicial(m)}
                              </span>
                              <div className="mi-equipo-miembro-datos">
                                <strong>
                                  {m.usuario_id?._id ? (
                                    <Link to={`/usuario/${m.usuario_id._id}`} className="perfil-publico-enlace">
                                      {m.usuario_id?.nombre || 'Anónimo'} {m.usuario_id?.apellido_paterno || ''}
                                    </Link>
                                  ) : (
                                    <>
                                      {m.usuario_id?.nombre || 'Anónimo'} {m.usuario_id?.apellido_paterno || ''}
                                    </>
                                  )}
                                </strong>
                                <span className="proyecto-badge">{ROL_EQUIPO_LABEL[m.rol] || m.rol}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  </Col>

                  <Col xl={4}>
                    <section className="dash-seccion h-100 mi-equipo-chat">
                      <div className="dash-seccion-cabecera">
                        <h3 className="proyectos-titulo mb-0" style={{ fontSize: '1.1rem' }}>
                          Chat del equipo
                        </h3>
                        <button
                          type="button"
                          className={`mi-equipo-silenciar${equipoActivo.silenciado ? ' silenciado' : ''}`}
                          title={
                            equipoActivo.silenciado
                              ? 'Reactivar notificaciones del chat'
                              : 'Silenciar notificaciones del chat'
                          }
                          aria-label={
                            equipoActivo.silenciado
                              ? 'Reactivar notificaciones del chat'
                              : 'Silenciar notificaciones del chat'
                          }
                          onClick={alternarSilencio}
                        >
                          <span className="material-symbols-outlined">
                            {equipoActivo.silenciado ? 'notifications_off' : 'notifications_active'}
                          </span>
                        </button>
                      </div>
                      <div className="mi-equipo-chat-caja" ref={chatRef}>
                        {mensajes.length === 0 ? (
                          <p className="proyectos-subtitulo text-center" style={{ margin: 'auto' }}>
                            Aún no hay mensajes. ¡Da el primer saludo!
                          </p>
                        ) : (
                          mensajes.map((m) => {
                            const propio =
                              String(m.usuario_id?._id || m.usuario_id) === String(usuario?._id || usuario?.id);
                            return (
                              <div key={String(m._id)} className={`mi-equipo-msg${propio ? ' propio' : ''}`}>
                                <span className="mi-equipo-msg-autor">
                                  {m.usuario_id?.nombre || 'Anónimo'} ·{' '}
                                  {new Date(m.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="mi-equipo-msg-texto">{m.contenido}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <Form onSubmit={enviar} className="mi-equipo-chat-form">
                        <InputGroup>
                          <Form.Control
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            placeholder="Escribe un mensaje…"
                            maxLength={1000}
                          />
                          <Button type="submit" className="proyectos-boton" disabled={enviando || !texto.trim()}>
                            {enviando ? <Spinner animation="border" size="sm" /> : 'Enviar'}
                          </Button>
                        </InputGroup>
                      </Form>
                    </section>
                  </Col>

                  <Col xl={4}>
                    <section className="dash-seccion h-100">
                      <div className="dash-seccion-cabecera">
                        <h3 className="proyectos-titulo mb-0" style={{ fontSize: '1.1rem' }}>
                          Herramientas
                        </h3>
                      </div>
                      <div className="mi-equipo-herramientas">
                        {HERRAMIENTAS.map((h) => (
                          <a
                            key={h.nombre}
                            href={h.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mi-equipo-herramienta"
                          >
                            <span className="mi-equipo-herramienta-icono">
                              <span className="material-symbols-outlined">{h.icono}</span>
                            </span>
                            <span className="mi-equipo-herramienta-datos">
                              <strong>{h.nombre}</strong>
                              <small>{h.descripcion}</small>
                            </span>
                          </a>
                        ))}
                      </div>
                      <p className="proyectos-subtitulo mb-0 mt-2" style={{ fontSize: '0.78rem' }}>
                        Accesos directos a herramientas externas. Se abren en otra pestaña.
                      </p>
                    </section>
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export default MiEquipoPage;
