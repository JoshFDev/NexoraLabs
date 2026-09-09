import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';
import IconoHabilidad from '../components/IconoHabilidad';
import './ProyectosPage.css';

const ETIQUETAS_TIPO = {
  curso: 'Curso',
  documentación: 'Documentación',
  video: 'Video',
  artículo: 'Artículo',
  libro: 'Libro',
};

const ETIQUETAS_NIVEL = {
  principiante: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
};

const ROLES_GESTION_RECURSOS = ['admin', 'mentor'];

function RecursosPage() {
  const usuario = JSON.parse(
    localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null'
  );

  const [lista, setLista] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [textoBuscar, setTextoBuscar] = useState('');
  const [buscar, setBuscar] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [expandido, setExpandido] = useState(null);
  const [califId, setCalifId] = useState(null);
  const [formResena, setFormResena] = useState(null);
  const [quitarId, setQuitarId] = useState(null);
  const [borrando, setBorrando] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [habilidades, setHabilidades] = useState([]);
  const [formNuevo, setFormNuevo] = useState({
    titulo: '',
    url: '',
    tipo: 'curso',
    nivel: 'principiante',
    descripcion: '',
    habilidad_id: '',
  });
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState('');
  const [creado, setCreado] = useState(false);

  const puedeGestionar = ROLES_GESTION_RECURSOS.includes(usuario?.rol);
  const idUsuario = usuario?._id || usuario?.id;

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams({ pagina, limite: '9', orden: 'recientes' });
    if (buscar) params.set('buscar', buscar);
    if (filtroTipo) params.set('tipo', filtroTipo);
    if (filtroNivel) params.set('nivel', filtroNivel);
    api
      .get(`/recursos-aprendizaje?${params}`)
      .then((res) => {
        const conRating = (res.data.recursos || []).map((r) => {
          const miResena = (r.comentarios || []).find(
            (c) => c.usuario_id && String(c.usuario_id?._id || c.usuario_id) === String(idUsuario)
          );
          return { ...r, _miResena: miResena || null };
        });
        setLista(conRating);
        setTotalPaginas(res.data.total_paginas || 1);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar recursos'))
      .finally(() => setCargando(false));
  }, [buscar, filtroTipo, filtroNivel, pagina, idUsuario]);

  const alternar = (id) => setExpandido((prev) => (prev === id ? null : id));

  const borrar = async (r) => {
    if (!window.confirm(`¿Borrar el recurso "${r.titulo}"?`)) return;
    setBorrando(String(r._id));
    setError('');
    try {
      await api.delete(`/recurso-aprendizaje/${r._id}`);
      setLista((prev) => prev.filter((x) => String(x._id) !== String(r._id)));
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el recurso');
    } finally {
      setBorrando(null);
    }
  };

  const calificar = async (r) => {
    if (!formResena?.estrellas) return;
    setCalifId(String(r._id));
    setError('');
    try {
      const res = await api.post(`/recurso-aprendizaje/${r._id}/calificar`, {
        calificacion: formResena.estrellas,
        texto: formResena.texto || '',
      });
      setFormResena(null);
      setLista((prev) =>
        prev.map((x) => {
          if (String(x._id) !== String(r._id)) return x;
          const d = res.data;
          const miResena = (d.comentarios || []).find(
            (c) => c.usuario_id && String(c.usuario_id?._id || c.usuario_id) === String(idUsuario)
          );
          return {
            ...x,
            valoracion_promedio: d.valoracion_promedio,
            num_valoraciones: d.num_valoraciones,
            comentarios: d.comentarios,
            _miResena: miResena || null,
          };
        })
      );
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la reseña');
    } finally {
      setCalifId(null);
    }
  };

  const quitarResena = async (r) => {
    if (!window.confirm('¿Eliminar tu reseña de este recurso?')) return;
    setQuitarId(String(r._id));
    setError('');
    try {
      const res = await api.delete(`/recurso-aprendizaje/own/${r._id}/calificacion`);
      setFormResena(null);
      setLista((prev) =>
        prev.map((x) => {
          if (String(x._id) !== String(r._id)) return x;
          const d = res.data;
          return {
            ...x,
            valoracion_promedio: d.valoracion_promedio,
            num_valoraciones: d.num_valoraciones,
            comentarios: d.comentarios,
            _miResena: null,
          };
        })
      );
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar la reseña');
    } finally {
      setQuitarId(null);
    }
  };

  const abrirModal = () => {
    setErrorCrear('');
    setCreado(false);
    setModalAbierto(true);
    api
      .get('/habilidades?limite=500')
      .then((res) => setHabilidades(res.data.habilidades || []))
      .catch(() => setHabilidades([]));
  };

  const crearRecurso = async (e) => {
    e.preventDefault();
    if (!formNuevo.titulo.trim()) {
      setErrorCrear('El título es obligatorio.');
      return;
    }
    setCreando(true);
    setErrorCrear('');
    try {
      await api.post('/recurso-aprendizaje/agregar', {
        titulo: formNuevo.titulo.trim(),
        url: formNuevo.url.trim(),
        tipo: formNuevo.tipo,
        nivel: formNuevo.nivel,
        descripcion: formNuevo.descripcion.trim(),
        habilidad_id: formNuevo.habilidad_id || undefined,
      });
      setCreado(true);
      setPagina(1);
      setBuscar('');
      setFiltroTipo('');
      setFiltroNivel('');
      setTimeout(() => {
        setModalAbierto(false);
        setFormNuevo({
          titulo: '',
          url: '',
          tipo: 'curso',
          nivel: 'principiante',
          descripcion: '',
          habilidad_id: '',
        });
      }, 700);
    } catch (err) {
      setErrorCrear(err.response?.data?.error || 'No se pudo crear el recurso');
    } finally {
      setCreando(false);
    }
  };

  const estrellas = (r) => {
    const valor = Math.round(r.valoracion_promedio || 0);
    return (
      <div className="recurso-estrellas">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`recurso-estrella${n <= valor ? ' llena' : ''}`} aria-hidden="true">
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <h2 className="proyectos-titulo mb-0">Recursos de aprendizaje</h2>
          {puedeGestionar && (
            <Button className="proyectos-boton" onClick={abrirModal}>
              Agregar recurso
            </Button>
          )}
        </div>
        <p className="proyectos-subtitulo mb-4">Material para dominar tus habilidades.</p>

        {error && <Alert variant="danger">{error}</Alert>}

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
              style={{ flex: '1 1 240px' }}
              placeholder="Buscar recursos…"
              value={textoBuscar}
              onChange={(e) => setTextoBuscar(e.target.value)}
            />
            <Form.Select
              value={filtroTipo}
              onChange={(e) => {
                setPagina(1);
                setFiltroTipo(e.target.value);
              }}
              style={{ width: 'auto' }}
            >
              <option value="">Tipo</option>
              {Object.entries(ETIQUETAS_TIPO).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Form.Select>
            <Form.Select
              value={filtroNivel}
              onChange={(e) => {
                setPagina(1);
                setFiltroNivel(e.target.value);
              }}
              style={{ width: 'auto' }}
            >
              <option value="">Nivel</option>
              {Object.entries(ETIQUETAS_NIVEL).map(([v, l]) => (
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
        ) : lista.length === 0 ? (
          <p className="proyectos-vacio">No hay recursos que coincidan con la búsqueda.</p>
        ) : (
          <>
            <Row className="g-4">
              {lista.map((r) => (
                <Col xl={4} md={6} key={String(r._id)}>
                  <article
                    className={`proyecto-fila h-100${expandido === String(r._id) ? ' abierto' : ''}`}
                    onClick={() => alternar(String(r._id))}
                  >
                    <div className="proyecto-fila-cabecera">
                      <h3 className="proyecto-titulo-tarjeta mb-1">{r.titulo}</h3>
                      <span className="proyecto-fila-flecha" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                    <div className="proyecto-meta mb-2">
                      <span className="proyecto-badge">{ETIQUETAS_TIPO[r.tipo] || r.tipo}</span>
                      <span className="proyecto-badge">{ETIQUETAS_NIVEL[r.nivel] || r.nivel}</span>
                      <span className="recurso-rating">
                        <span className="recurso-estrella llena">★</span>{' '}
                        {(r.valoracion_promedio || 0).toFixed(1)}
                        <span className="recurso-rating-num">({r.num_valoraciones || 0})</span>
                      </span>
                    </div>
                    {r.descripcion && <p className="proyecto-descripcion recurso-recorte">{r.descripcion}</p>}
                    <div className={`proyecto-fila-contenido${expandido === String(r._id) ? ' abierto' : ''}`}>
                      <section className="proyecto-fila-detalle">
                        <div className="proyecto-detalle-bloque">
                          <span className="proyecto-detalle-etiqueta">Descripción</span>
                          <p className="proyecto-detalle-texto recurso-descripcion">
                            {r.descripcion || 'Sin descripción.'}
                          </p>
                        </div>
                      </section>
                      <section className="proyecto-fila-detalle">
                        <div className="proyecto-detalle-bloque">
                          <span className="proyecto-detalle-etiqueta">Habilidad</span>
                          <div className="proyecto-detalle-chips">
                            {r.habilidad_id?.nombre ? (
                              <span className="proyecto-detalle-chip">
                                <IconoHabilidad nombre={r.habilidad_id.nombre} />
                                {r.habilidad_id.nombre}
                              </span>
                            ) : (
                              <span className="proyecto-detalle-texto">General</span>
                            )}
                          </div>
                        </div>
                      </section>
                      <section className="proyecto-fila-detalle">
                        <div className="proyecto-detalle-bloque">
                          <span className="proyecto-detalle-etiqueta">Valoración</span>
                          {estrellas(r)}
                          <div className="d-flex align-items-center gap-2 mt-1 mb-2">
                            <span className="proyecto-detalle-texto">
                              {r.valoracion_promedio > 0
                                ? `${r.valoracion_promedio.toFixed(1)}/5 de ${r.num_valoraciones} valoración(es)`
                                : 'Todavía sin valorar'}
                            </span>
                          </div>
                          {formResena?.id === String(r._id) && (
                            <div className="proyecto-postulacion-form mt-2">
                              <div className="d-flex gap-1 mb-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    className={`recurso-estrella${n <= formResena.estrellas ? ' llena' : ''}`}
                                    style={{ background: 'none', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}
                                    onClick={() => setFormResena((f) => ({ ...f, estrellas: n }))}
                                  >
                                    ★
                                  </button>
                                ))}
                                <span className="proyecto-detalle-texto ms-2" style={{ fontSize: '0.8rem' }}>
                                  {formResena.estrellas || 0}/5
                                </span>
                              </div>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                className="proyecto-post-mensaje"
                                placeholder="¿Qué te pareció? (opcional)"
                                value={formResena.texto}
                                onChange={(e) => setFormResena((f) => ({ ...f, texto: e.target.value }))}
                              />
                              <div className="d-flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  className="proyectos-boton"
                                  disabled={califId === String(r._id) || !formResena.estrellas}
                                  onClick={() => calificar(r)}
                                >
                                  {califId === String(r._id)
                                    ? 'Guardando…'
                                    : r._miResena
                                    ? 'Actualizar reseña'
                                    : 'Publicar reseña'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-light"
                                  className="proyectos-boton"
                                  disabled={califId === String(r._id)}
                                  onClick={() => setFormResena(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                          {!formResena || formResena.id !== String(r._id) ? (
                            <div className="d-flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                className="proyectos-boton"
                                disabled={califId === String(r._id)}
                                onClick={(ev) => {
                                  ev.stopPropagation();
                                  setFormResena({
                                    id: String(r._id),
                                    estrellas: r._miResena?.calificacion || 0,
                                    texto: r._miResena?.texto || '',
                                  });
                                }}
                              >
                                {r._miResena ? 'Editar mi reseña' : 'Calificar'}
                              </Button>
                              {r._miResena && (
                                <Button
                                  size="sm"
                                  variant="outline-light"
                                  className="proyectos-boton"
                                  disabled={quitarId === String(r._id)}
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    quitarResena(r);
                                  }}
                                >
                                  {quitarId === String(r._id) ? 'Eliminando…' : 'Eliminar mi reseña'}
                                </Button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </section>
                      <section className="proyecto-fila-detalle">
                        <div className="proyecto-detalle-bloque">
                          <span className="proyecto-detalle-etiqueta">
                            Reseñas ({r.comentarios?.length || 0})
                          </span>
                          {r.comentarios?.length ? (
                            <div className="equipo-miembros">
                              {r.comentarios.map((c, i) => {
                                const autor = c.usuario_id;
                                return (
                                  <div className="equipo-miembro" key={i}>
                                    <div>
                                      <strong>
                                        {autor?._id ? (
                                          <Link to={`/usuario/${autor._id}`} className="perfil-publico-enlace">
                                            {autor.nombre || 'Anónimo'} {autor.apellido_paterno || ''}
                                          </Link>
                                        ) : (
                                          <>{(autor?.nombre || 'Usuario')} {autor?.apellido_paterno || ''}</>
                                        )}
                                      </strong>
                                      <div className="recurso-estrellas">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                          <span key={n} className={`recurso-estrella${n <= c.calificacion ? ' llena' : ''}`}>★</span>
                                        ))}
                                      </div>
                                      {c.texto && <p className="proyecto-detalle-texto mb-0">{c.texto}</p>}
                                      <span className="proyecto-creador" style={{ fontSize: '0.7rem' }}>
                                        {new Date(c.fecha).toLocaleDateString('es')}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="proyecto-detalle-texto">Sin reseñas todavía. ¡Sé el primero!</p>
                          )}
                        </div>
                      </section>
                    </div>
                    <footer className="proyecto-creador">Valorado
                      {r.valoracion_promedio > 0 ? (
                        <> {r.valoracion_promedio.toFixed(1)}/5 por {r.num_valoraciones} usuario(s)</>
                      ) : (
                        <> todavía sin calificar</>
                      )}
                    </footer>
                    <div className="equipo-acciones">
                      {r.url && (
                        <Button
                          size="sm"
                          className="proyectos-boton"
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          Abrir recurso
                        </Button>
                      )}
                      {puedeGestionar && (
                        <Button
                          size="sm"
                          variant="outline-light"
                          className="proyectos-boton recurso-borrar"
                          disabled={borrando === String(r._id)}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            borrar(r);
                          }}
                        >
                          Eliminar
                        </Button>
                      )}
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

      <Modal show={modalAbierto} onHide={() => setModalAbierto(false)} centered className="equipo-modal">
        <Modal.Header closeButton className="equipo-modal-head">
          <Modal.Title className="proyectos-titulo">Agregar recurso</Modal.Title>
        </Modal.Header>
        <Modal.Body className="equipo-modal-body">
          {errorCrear && <Alert variant="danger">{errorCrear}</Alert>}
          {creado && (
            <div className="proyectos-bloqueo" style={{ margin: '0 auto 1rem' }}>
              <span className="dash-bloqueo-icono" style={{ color: '#34d399' }}>✓</span>
              <h3>¡Recurso agregado!</h3>
            </div>
          )}
          {!creado && (
            <Form onSubmit={crearRecurso} className="proyecto-form">
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Título *</Form.Label>
                <Form.Control
                  value={formNuevo.titulo}
                  onChange={(e) => setFormNuevo((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej. Curso práctico de Node.js"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">URL</Form.Label>
                <Form.Control
                  value={formNuevo.url}
                  onChange={(e) => setFormNuevo((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://…"
                />
              </Form.Group>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="proyecto-form-label">Tipo</Form.Label>
                    <Form.Select
                      value={formNuevo.tipo}
                      onChange={(e) => setFormNuevo((f) => ({ ...f, tipo: e.target.value }))}
                    >
                      {Object.entries(ETIQUETAS_TIPO).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="proyecto-form-label">Nivel</Form.Label>
                    <Form.Select
                      value={formNuevo.nivel}
                      onChange={(e) => setFormNuevo((f) => ({ ...f, nivel: e.target.value }))}
                    >
                      {Object.entries(ETIQUETAS_NIVEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Habilidad relacionada</Form.Label>
                <Form.Select
                  value={formNuevo.habilidad_id}
                  onChange={(e) => setFormNuevo((f) => ({ ...f, habilidad_id: e.target.value }))}
                >
                  <option value="">General</option>
                  {habilidades.map((h) => (
                    <option key={String(h._id)} value={h._id}>{h.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formNuevo.descripcion}
                  onChange={(e) => setFormNuevo((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="¿De qué trata el recurso?"
                />
              </Form.Group>
              <div className="d-flex gap-3">
                <Button type="submit" className="proyectos-boton" disabled={creando}>
                  {creando ? <Spinner animation="border" size="sm" /> : 'Agregar recurso'}
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

export default RecursosPage;