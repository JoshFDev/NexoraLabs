import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';
import './ProyectosPage.css';

const ETIQUETAS_ESTADO_EQUIPO = {
  activo: 'Activo',
  finalizado: 'Finalizado',
  disuelto: 'Disuelto',
};

const ROLES_CREADOR_EQUIPO = ['admin', 'mentor'];

function EquiposPage() {
  const usuario =
    JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null');

  const [equipos, setEquipos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [textoBuscar, setTextoBuscar] = useState('');
  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [expandido, setExpandido] = useState(null);
  const [miembrosMap, setMiembrosMap] = useState({});
  const [misEquipos, setMisEquipos] = useState(null);
  const [misSolicitudesEnviadas, setMisSolicitudesEnviadas] = useState([]);
  const [solicitudesEquipo, setSolicitudesEquipo] = useState([]);
  const [cargandoAccion, setCargandoAccion] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [misProyectos, setMisProyectos] = useState([]);
  const [formCrear, setFormCrear] = useState({ proyecto_id: '', nombre: '', descripcion: '' });
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState('');
  const [creado, setCreado] = useState(false);

  const puedeCrear = ROLES_CREADOR_EQUIPO.includes(usuario?.rol);

  const cargarMisEquipos = useCallback(() => {
    api
      .get('/mis-equipos')
      .then((res) => setMisEquipos(new Set((res.data || []).map((e) => String(e._id)))))
      .catch(() => setMisEquipos(new Set()));
  }, []);

  const cargarMisSolicitudesEnviadas = useCallback(() => {
    api
      .get('/mis-solicitudes-enviadas')
      .then((res) => {
        const pendientes = (res.data || []).filter((s) => s.estado === 'pendiente');
        const pendientesMap = {};
        pendientes.forEach((p) => {
          pendientesMap[String(p.equipo_id?._id || p.equipo_id)] = String(p._id);
        });
        setMisSolicitudesEnviadas(pendientesMap);
      })
      .catch(() => setMisSolicitudesEnviadas({}));
  }, []);

  const cargarSolicitudesEquipo = useCallback(() => {
    api
      .get('/mis-solicitudes-equipo')
      .then((res) => setSolicitudesEquipo(res.data || []))
      .catch(() => setSolicitudesEquipo([]));
  }, []);

  useEffect(() => {
    cargarMisEquipos();
  }, [cargarMisEquipos]);

  useEffect(() => {
    cargarMisSolicitudesEnviadas();
  }, [cargarMisSolicitudesEnviadas]);

  useEffect(() => {
    cargarSolicitudesEquipo();
  }, [cargarSolicitudesEquipo]);

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams({ pagina, limite: '8', orden: 'recientes' });
    if (buscar) params.set('buscar', buscar);
    if (filtroEstado) params.set('estado', filtroEstado);
    api
      .get(`/equipos?${params}`)
      .then((res) => {
        setEquipos(res.data.equipos || []);
        setTotalPaginas(res.data.total_paginas || 1);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar equipos'))
      .finally(() => setCargando(false));
  }, [buscar, filtroEstado, pagina]);

  const alternar = async (id) => {
    if (expandido === id) {
      setExpandido(null);
      return;
    }
    setExpandido(id);
    if (!miembrosMap[id]) {
      api
        .get(`/equipo/${id}/miembros`)
        .then((res) => setMiembrosMap((m) => ({ ...m, [id]: res.data || [] })))
        .catch(() => setMiembrosMap((m) => ({ ...m, [id]: [] })));
    }
  };

  const solicitar = async (e) => {
    setCargandoAccion(String(e._id));
    setError('');
    try {
      await api.post(`/equipo/${e._id}/solicitar`, {});
      await cargarMisSolicitudesEnviadas();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar la solicitud');
    } finally {
      setCargandoAccion(null);
    }
  };

  const cancelarSolicitud = async (e) => {
    const solicitudId = misSolicitudesEnviadas[String(e._id)];
    if (!solicitudId) return;
    setCargandoAccion(String(e._id));
    setError('');
    try {
      await api.delete(`/solicitud-equipo/own/${solicitudId}`);
      await cargarMisSolicitudesEnviadas();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cancelar la solicitud');
    } finally {
      setCargandoAccion(null);
    }
  };

  const resolverSolicitud = async (solicitud, estado) => {
    setCargandoAccion(`sol-${String(solicitud._id)}`);
    setError('');
    try {
      await api.put(`/solicitud-equipo/${solicitud._id}/estado`, { estado });
      await Promise.all([cargarSolicitudesEquipo(), cargarMisEquipos()]);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo procesar la solicitud');
    } finally {
      setCargandoAccion(null);
    }
  };

  const salir = async (e) => {
    setCargandoAccion(String(e._id));
    setError('');
    try {
      await api.delete(`/equipo/${e._id}/salir`);
      await cargarMisEquipos();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo salir del equipo');
    } finally {
      setCargandoAccion(null);
    }
  };

  const recargarMiembros = (equipoId) => {
    api
      .get(`/equipo/${equipoId}/miembros`)
      .then((res) => setMiembrosMap((m) => ({ ...m, [String(equipoId)]: res.data || [] })))
      .catch(() => {});
  };

  const cambiarRol = async (equipoId, miembroId, rol) => {
    setCargandoAccion(`miembro-${String(miembroId)}`);
    setError('');
    try {
      await api.put(`/equipo/${equipoId}/miembros/${miembroId}/rol`, { rol });
      recargarMiembros(equipoId);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar el rol');
    } finally {
      setCargandoAccion(null);
    }
  };

  const quitarMiembro = async (equipoId, miembroId) => {
    if (!window.confirm('¿Quitar a este integrante del equipo?')) return;
    setCargandoAccion(`miembro-${String(miembroId)}`);
    setError('');
    try {
      await api.delete(`/equipo/${equipoId}/miembros/${miembroId}`);
      recargarMiembros(equipoId);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo quitar al integrante');
    } finally {
      setCargandoAccion(null);
    }
  };

  const abrirModal = () => {
    setErrorCrear('');
    setCreado(false);
    setModalAbierto(true);
    if (usuario?._id) {
      api
        .get(`/proyectos?creador=${usuario._id}&limite=100&orden=recientes`)
        .then((res) => setMisProyectos(res.data.proyectos || []))
        .catch(() => setMisProyectos([]));
    }
  };

  const crearEquipo = async (e) => {
    e.preventDefault();
    if (!formCrear.proyecto_id || formCrear.nombre.trim().length < 3) {
      setErrorCrear('Elige un proyecto y escribe un nombre de al menos 3 caracteres.');
      return;
    }
    setCreando(true);
    setErrorCrear('');
    try {
      await api.post('/equipo/agregar', {
        proyecto_id: formCrear.proyecto_id,
        nombre: formCrear.nombre.trim(),
        descripcion: formCrear.descripcion.trim(),
      });
      setCreado(true);
      setPagina(1);
      setBuscar('');
      setFiltroEstado('');
      setTimeout(() => {
        setModalAbierto(false);
        setFormCrear({ proyecto_id: '', nombre: '', descripcion: '' });
      }, 700);
    } catch (err) {
      setErrorCrear(err.response?.data?.error || 'No se pudo crear el equipo');
    } finally {
      setCreando(false);
    }
  };

  const soyMiembro = (id) => misEquipos?.has(String(id));

  const soyCreadorDelEquipo = (e) =>
    !!usuario?._id && !!e.proyecto_id?.creador_id &&
    String(e.proyecto_id.creador_id) === String(usuario._id);

  const puedeGestionar = (e) => soyCreadorDelEquipo(e) || puedeCrear;

  const solicitudPendienteDe = (id) => misSolicitudesEnviadas[String(id)] || null;

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <h2 className="proyectos-titulo mb-0">Equipos</h2>
          {puedeCrear && (
            <Button className="proyectos-boton" onClick={abrirModal}>
              Crear equipo
            </Button>
          )}
        </div>
        <p className="proyectos-subtitulo mb-4">Forma parte de un equipo y construye en conjunto.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        {solicitudesEquipo.length > 0 && (
          <section className="mb-4">
            <h4 className="proyectos-titulo" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Solicitudes por aprobar
            </h4>
            <div className="equipo-miembros">
              {solicitudesEquipo.map((s) => (
                <div className="equipo-miembro" key={String(s._id)}>
                  <div>
                    <strong>
                      {s.usuario_id?._id ? (
                        <Link to={`/usuario/${s.usuario_id._id}`} className="perfil-publico-enlace">
                          {s.usuario_id?.nombre || 'Anónimo'}{' '}
                          {s.usuario_id?.apellido_paterno || ''}
                        </Link>
                      ) : (
                        <>{(s.usuario_id?.nombre || 'Usuario')} {s.usuario_id?.apellido_paterno || ''}</>
                      )}
                    </strong>
                    <div className="proyecto-detalle-texto">
                      Solicitó entrar a <strong>{s.equipo_id?.nombre || 'un equipo'}</strong>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      className="proyectos-boton"
                      style={{ background: '#34d399', borderColor: '#34d399', color: '#0b0a14' }}
                      disabled={cargandoAccion === `sol-${String(s._id)}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        resolverSolicitud(s, 'aprobada');
                      }}
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-light"
                      className="proyectos-boton"
                      disabled={cargandoAccion === `sol-${String(s._id)}`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        resolverSolicitud(s, 'rechazada');
                      }}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="proyectos-toolbar mb-4">
          <Form
            className="d-flex gap-3 flex-grow-1 flex-wrap align-items-center"
            onSubmit={(e) => {
              e.preventDefault();
              setPagina(1);
              setBuscar(textoBuscar.trim());
            }}
          >
            <Form.Control
              className="proyectos-buscar"
              placeholder="Buscar equipos…"
              value={textoBuscar}
              onChange={(e) => setTextoBuscar(e.target.value)}
            />
            <Form.Select
              value={filtroEstado}
              onChange={(e) => {
                setPagina(1);
                setFiltroEstado(e.target.value);
              }}
              style={{ width: 'auto' }}
            >
              <option value="">Estado</option>
              {Object.entries(ETIQUETAS_ESTADO_EQUIPO).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Form.Select>
            <Button type="submit" variant="primary" className="proyectos-boton">
              Buscar
            </Button>
          </Form>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : equipos.length === 0 ? (
          <p className="proyectos-vacio">No hay equipos que coincidan con la búsqueda.</p>
        ) : (
          <>
            <Row className="g-4">
              {equipos.map((e) => (
                <Col lg={6} key={String(e._id)}>
                  <article
                    className={`proyecto-fila h-100${expandido === String(e._id) ? ' abierto' : ''}`}
                    onClick={() => alternar(String(e._id))}
                  >
                    <div className="proyecto-fila-cabecera">
                      <h3 className="proyecto-titulo-tarjeta mb-1">{e.nombre}</h3>
                      <span className="proyecto-fila-flecha" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                    <div className="proyecto-meta mb-2">
                      <span className="proyecto-badge">{ETIQUETAS_ESTADO_EQUIPO[e.estado] || e.estado}</span>
                      <span className="proyecto-badge">{e.n_miembros || 0} integrante(s)</span>
                      {e.proyecto_id?.titulo && (
                        <span className="proyecto-badge">Proyecto: {e.proyecto_id.titulo}</span>
                      )}
                    </div>
                    {e.descripcion && <p className="proyecto-descripcion">{e.descripcion}</p>}
                    <div className={`proyecto-fila-contenido${expandido === String(e._id) ? ' abierto' : ''}`}>
                      <section className="proyecto-fila-detalle">
                        <div className="proyecto-detalle-bloque">
                          <span className="proyecto-detalle-etiqueta">Integrantes</span>
                          {miembrosMap[String(e._id)] ? (
                            miembrosMap[String(e._id)].length ? (
                              <div className="equipo-miembros">
                                {miembrosMap[String(e._id)].map((m) => (
                                  <div className="equipo-miembro" key={String(m._id)}>
                                    <div>
                                      <strong>
                                        {m.usuario_id?._id ? (
                                          <Link to={`/usuario/${m.usuario_id._id}`} className="perfil-publico-enlace">
                                            {m.usuario_id?.nombre || 'Anónimo'}{' '}
                                            {m.usuario_id?.apellido_paterno || ''}
                                          </Link>
                                        ) : (
                                          <>{(m.usuario_id?.nombre || 'Anónimo')} {m.usuario_id?.apellido_paterno || ''}</>
                                        )}
                                      </strong>
                                      <div className="proyecto-detalle-texto">{m.usuario_id?.email || ''}</div>
                                    </div>
                                    {puedeGestionar(e) ? (
                                      <div className="d-flex flex-wrap align-items-center gap-2">
                                        <Form.Select
                                          size="sm"
                                          style={{ width: 'auto', fontSize: '0.78rem' }}
                                          value={m.rol || 'miembro'}
                                          disabled={cargandoAccion === `miembro-${String(m._id)}`}
                                          onChange={(ev) => cambiarRol(e._id, m._id, ev.target.value)}
                                          onClick={(ev) => ev.stopPropagation()}
                                        >
                                          <option value="lider">Líder</option>
                                          <option value="colaborador">Colaborador</option>
                                          <option value="miembro">Miembro</option>
                                        </Form.Select>
                                        <Button
                                          size="sm"
                                          variant="outline-light"
                                          className="proyectos-boton"
                                          disabled={cargandoAccion === `miembro-${String(m._id)}`}
                                          onClick={(ev) => {
                                            ev.stopPropagation();
                                            quitarMiembro(e._id, m._id);
                                          }}
                                        >
                                          Quitar
                                        </Button>
                                      </div>
                                    ) : (
                                      <span className="proyecto-badge">{m.rol || 'miembro'}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="proyecto-detalle-texto">Sin integrantes todavía.</span>
                            )
                          ) : (
                            <Spinner animation="border" size="sm" variant="secondary" />
                          )}
                        </div>
                      </section>
                    </div>
                    <footer className="proyecto-creador">
                      Creado {new Date(e.fecha_creacion).toLocaleDateString('es')}
                    </footer>
                    <div className="equipo-acciones">
                      {e.estado === 'activo' &&
                        (soyMiembro(String(e._id)) ? (
                          <Button
                            size="sm"
                            variant="outline-light"
                            className="proyectos-boton"
                            disabled={cargandoAccion === String(e._id)}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              salir(e);
                            }}
                          >
                            Salir del equipo
                          </Button>
                        ) : solicitudPendienteDe(String(e._id)) ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className="proyecto-badge" style={{ background: '#2a2740', color: '#c9c4de' }}>
                              Solicitud enviada
                            </span>
                            <Button
                              size="sm"
                              variant="outline-light"
                              className="proyectos-boton"
                              disabled={cargandoAccion === String(e._id)}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                cancelarSolicitud(e);
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="proyectos-boton"
                            disabled={cargandoAccion === String(e._id)}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              solicitar(e);
                            }}
                          >
                            Solicitar unirme
                          </Button>
                        ))}
                    </div>
                  </article>
                </Col>
              ))}
            </Row>

            {totalPaginas > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
                <Button
                  variant="outline-light"
                  className="proyectos-boton"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span style={{ fontSize: '0.85rem', color: '#8b84a3' }}>
                  Página {pagina} de {totalPaginas}
                </span>
                <Button
                  variant="outline-light"
                  className="proyectos-boton"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </Container>

      <Modal
        show={modalAbierto}
        onHide={() => setModalAbierto(false)}
        centered
        className="equipo-modal"
      >
        <Modal.Header closeButton className="equipo-modal-head">
          <Modal.Title className="proyectos-titulo">Crear equipo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="equipo-modal-body">
          {errorCrear && <Alert variant="danger">{errorCrear}</Alert>}
          {creado && (
            <div className="proyectos-bloqueo" style={{ margin: '0 auto 1rem' }}>
              <span className="dash-bloqueo-icono" style={{ color: '#34d399' }}>✓</span>
              <h3>¡Equipo creado!</h3>
            </div>
          )}
          {!creado && (
            <Form onSubmit={crearEquipo} className="proyecto-form">
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Proyecto *</Form.Label>
                <Form.Select
                  value={formCrear.proyecto_id}
                  onChange={(e) => setFormCrear((f) => ({ ...f, proyecto_id: e.target.value }))}
                >
                  <option value="">Elige un proyecto tuyo</option>
                  {misProyectos.map((p) => (
                    <option key={String(p._id)} value={p._id}>{p.titulo}</option>
                  ))}
                </Form.Select>
                {misProyectos.length === 0 && (
                  <Form.Text className="proyecto-form-ayuda">
                    Necesitas tener un proyecto creado para armar un equipo.
                  </Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Nombre del equipo *</Form.Label>
                <Form.Control
                  value={formCrear.nombre}
                  onChange={(e) => setFormCrear((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Devs del Norte"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formCrear.descripcion}
                  onChange={(e) => setFormCrear((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="¿En qué van a trabajar como equipo?"
                />
              </Form.Group>
              <div className="d-flex gap-3">
                <Button type="submit" className="proyectos-boton" disabled={creando}>
                  {creando ? <Spinner animation="border" size="sm" /> : 'Crear equipo'}
                </Button>
                <Button
                  variant="outline-light"
                  className="proyectos-boton"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default EquiposPage;