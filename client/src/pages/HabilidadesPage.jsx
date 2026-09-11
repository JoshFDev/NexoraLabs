import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import api from '../api';
import IconoHabilidad from '../components/IconoHabilidad';
import './ProyectosPage.css';

const CATEGORIAS = [
  'Desarrollo Web',
  'Backend',
  'Frontend',
  'Bases de Datos',
  'Redes',
  'Ciberseguridad',
  'IoT',
  'Electrónica',
  'Inteligencia Artificial',
  'Cloud',
  'DevOps',
  'Sistemas Operativos',
];

const ETIQUETAS_NIVEL = {
  principiante: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
};

const ROLES_GESTION_HABILIDADES = ['admin'];

const FORM_VACIO = {
  nombre: '',
  categoria: '',
  nivel_minimo: 'principiante',
  tiempo_estimado: '',
  descripcion: '',
  etiquetas: '',
  popularidad: 0,
  visible: true,
};

function HabilidadesPage() {
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
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [orden, setOrden] = useState('a-z');
  const [expandido, setExpandido] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(null);
  const [version, setVersion] = useState(0);
  const [misHabilidades, setMisHabilidades] = useState([]);
  const [accionHabilidad, setAccionHabilidad] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState(false);

  const puedeGestionar = ROLES_GESTION_HABILIDADES.includes(usuario?.rol);

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams({ pagina, limite: '12', orden });
    if (buscar) params.set('buscar', buscar);
    if (filtroCategoria) params.set('categoria', filtroCategoria);
    if (filtroNivel) params.set('nivel', filtroNivel);
    api
      .get(`/habilidades?${params}`)
      .then((res) => {
        setLista(res.data.habilidades || []);
        setTotalPaginas(res.data.total_paginas || 1);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar habilidades'))
      .finally(() => setCargando(false));
  }, [buscar, filtroCategoria, filtroNivel, orden, pagina, version]);

  const alternar = (id) => setExpandido((prev) => (prev === id ? null : id));

  useEffect(() => {
    if (puedeGestionar) return;
    api
      .get('/mis-habilidades')
      .then((res) => setMisHabilidades(res.data || []))
      .catch(() => setMisHabilidades([]));
  }, [puedeGestionar]);

  const enMiPerfil = (h) =>
    misHabilidades.some((r) => String(r.habilidad_id?._id || r.habilidad_id) === String(h._id));

  const alternarSeleccion = async (h, ev) => {
    ev.stopPropagation();
    const yaTengo = enMiPerfil(h);
    setAccionHabilidad(String(h._id));
    setError('');
    try {
      if (yaTengo) {
        const reg = misHabilidades.find(
          (r) => String(r.habilidad_id?._id || r.habilidad_id) === String(h._id)
        );
        await api.delete(`/usuario-habilidad/own/${reg._id}`);
        setMisHabilidades((prev) => prev.filter((r) => String(r._id) !== String(reg._id)));
      } else {
        const res = await api.post('/usuario-habilidad/agregar', {
          usuario_id: usuario?._id || usuario?.id,
          habilidad_id: h._id,
          nivel: 'principiante',
        });
        setMisHabilidades((prev) => [...prev, res.data]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar tu perfil');
    } finally {
      setAccionHabilidad('');
    }
  };

  const confirmarBorrarAhora = async () => {
    const h = confirmarBorrar;
    if (!h) return;
    setBorrando(String(h._id));
    setError('');
    try {
      await api.delete(`/habilidad/${h._id}`);
      setLista((prev) => prev.filter((x) => String(x._id) !== String(h._id)));
      setConfirmarBorrar(null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar la habilidad');
    } finally {
      setBorrando(null);
    }
  };

  const abrirModal = (habilidad = null) => {
    setEditando(habilidad);
    setExito(false);
    setErrorForm('');
    setForm(
      habilidad
        ? {
            nombre: habilidad.nombre,
            categoria: habilidad.categoria,
            nivel_minimo: habilidad.nivel_minimo || 'principiante',
            tiempo_estimado: habilidad.tiempo_estimado || '',
            descripcion: habilidad.descripcion || '',
            etiquetas: (habilidad.etiquetas || []).join(', '),
            popularidad: habilidad.popularidad || 0,
            visible: habilidad.visible !== false,
          }
        : FORM_VACIO
    );
    setModalAbierto(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.categoria) {
      setErrorForm('El nombre y la categoría son obligatorios.');
      return;
    }
    setGuardando(true);
    setErrorForm('');
    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      nivel_minimo: form.nivel_minimo,
      tiempo_estimado: form.tiempo_estimado.trim(),
      descripcion: form.descripcion.trim(),
      etiquetas: form.etiquetas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      popularidad: Number(form.popularidad) || 0,
      visible: form.visible,
    };
    try {
      if (editando) {
        const res = await api.put(`/habilidad/${editando._id}`, payload);
        setLista((prev) =>
          prev.map((x) => (String(x._id) === String(editando._id) ? res.data : x))
        );
      } else {
        await api.post('/habilidad/agregar', payload);
        setPagina(1);
        setBuscar('');
        setFiltroCategoria('');
        setFiltroNivel('');
        setVersion((v) => v + 1);
      }
      setExito(true);
      setTimeout(() => {
        setModalAbierto(false);
        setEditando(null);
      }, 700);
    } catch (err) {
      setErrorForm(err.response?.data?.error || (editando ? 'No se pudo actualizar la habilidad' : 'No se pudo crear la habilidad'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
          <h2 className="proyectos-titulo mb-0">Habilidades</h2>
          {puedeGestionar && (
            <Button className="proyectos-boton" onClick={() => abrirModal()}>
              Agregar habilidad
            </Button>
          )}
        </div>
        <p className="proyectos-subtitulo mb-4">
          {puedeGestionar
            ? 'Catálogo de habilidades de la plataforma. Tú eres quien las administra.'
            : 'Catálogo de habilidades de la plataforma. Toca una para agregarla a tu perfil y que te encuentren.'}
        </p>

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
              placeholder="Buscar habilidades…"
              value={textoBuscar}
              onChange={(e) => setTextoBuscar(e.target.value)}
            />
            <Form.Select
              value={filtroCategoria}
              onChange={(e) => {
                setPagina(1);
                setFiltroCategoria(e.target.value);
              }}
              style={{ width: 'auto' }}
            >
              <option value="">Categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
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
            <Form.Select
              value={orden}
              onChange={(e) => {
                setPagina(1);
                setOrden(e.target.value);
              }}
              style={{ width: 'auto' }}
            >
              <option value="a-z">A → Z</option>
              <option value="z-a">Z → A</option>
              <option value="recientes">Más recientes</option>
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
          <p className="proyectos-vacio">No hay habilidades que coincidan con la búsqueda.</p>
        ) : (
          <>
            <Row className="g-4">
              {lista.map((h) => (
                <Col xl={4} md={6} key={String(h._id)}>
                  <article
                    className={`proyecto-fila h-100${expandido === String(h._id) ? ' abierto' : ''}`}
                    onClick={() => alternar(String(h._id))}
                  >
                    <div className="proyecto-fila-cabecera habilidad-fila-cabecera">
                      <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
                        <span
                          className="proyecto-chip-habilidad seleccionada"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
                        >
                          <IconoHabilidad nombre={h.nombre} />
                        </span>
                        <h3 className="proyecto-titulo-tarjeta mb-0">{h.nombre}</h3>
                      </div>
                      <span className="proyecto-fila-flecha" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </div>
                    <div className="proyecto-meta mb-2">
                      <span className="proyecto-badge">{h.categoria}</span>
                      <span className="proyecto-badge">{ETIQUETAS_NIVEL[h.nivel_minimo] || h.nivel_minimo}</span>
                      {h.tiempo_estimado && <span className="proyecto-badge">{h.tiempo_estimado}</span>}
                      {!puedeGestionar && enMiPerfil(h) && (
                        <span className="proyecto-badge habilidad-en-perfil">✓ En tu perfil</span>
                      )}
                    </div>
                    {h.descripcion && <p className="proyecto-descripcion recurso-recorte">{h.descripcion}</p>}
                    <div className={`proyecto-fila-contenido${expandido === String(h._id) ? ' abierto' : ''}`}>
                      <section className="proyecto-fila-detalle">
                        <div className="proyecto-detalle-bloque">
                          <span className="proyecto-detalle-etiqueta">Descripción</span>
                          <p className="proyecto-detalle-texto recurso-descripcion">
                            {h.descripcion || 'Sin descripción.'}
                          </p>
                        </div>
                      </section>
                      <section className="proyecto-fila-detalle">
                        <div className="proyecto-detalle-bloque">
                          <span className="proyecto-detalle-etiqueta">Etiquetas</span>
                          <div className="proyecto-detalle-chips">
                            {h.etiquetas?.length ? (
                              h.etiquetas.map((t) => (
                                <span key={t} className="proyecto-detalle-chip">{t}</span>
                              ))
                            ) : (
                              <span className="proyecto-detalle-texto">Sin etiquetas.</span>
                            )}
                          </div>
                        </div>
                      </section>
                    </div>
                    <footer className="proyecto-creador">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.8rem' }}>Popularidad</span>
                        <span className="habilidad-pop flex-grow-1">
                          <span style={{ width: `${Math.min(h.popularidad || 0, 100)}%` }} />
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--nx-morado-oscuro)', minWidth: '2.2rem', textAlign: 'right' }}>
                          {h.popularidad || 0}%
                        </span>
                      </div>
                    </footer>
                    {!puedeGestionar && (
                      <div className="equipo-acciones">
                        <Button
                          size="sm"
                          variant={enMiPerfil(h) ? 'primary' : 'outline-light'}
                          className={`proyectos-boton${enMiPerfil(h) ? ' habilidad-seleccionada' : ''}`}
                          disabled={accionHabilidad === String(h._id)}
                          onClick={(ev) => alternarSeleccion(h, ev)}
                        >
                          {accionHabilidad === String(h._id) ? (
                            <Spinner animation="border" size="sm" />
                          ) : enMiPerfil(h) ? (
                            'Quitar de mi perfil'
                          ) : (
                            'Agregar a mi perfil'
                          )}
                        </Button>
                      </div>
                    )}
                    {puedeGestionar && (
                      <div className="equipo-acciones">
                        <Button
                          size="sm"
                          variant="outline-light"
                          className="proyectos-boton"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            abrirModal(h);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-light"
                          className="proyectos-boton recurso-borrar"
                          disabled={borrando === String(h._id)}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setConfirmarBorrar(h);
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    )}
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
          <Modal.Title className="proyectos-titulo">
            {editando ? `Editar: ${editando.nombre}` : 'Agregar habilidad'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="equipo-modal-body">
          {errorForm && <Alert variant="danger">{errorForm}</Alert>}
          {exito && (
            <div className="proyectos-bloqueo" style={{ margin: '0 auto 1rem' }}>
              <span className="dash-bloqueo-icono" style={{ color: '#34d399' }}>✓</span>
              <h3>{editando ? '¡Habilidad actualizada!' : '¡Habilidad agregada!'}</h3>
            </div>
          )}
          {!exito && (
            <Form onSubmit={guardar} className="proyecto-form">
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Nombre *</Form.Label>
                <Form.Control
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. React"
                />
              </Form.Group>
              <Row className="g-3 mb-3">
                <Col md={7}>
                  <Form.Group>
                    <Form.Label className="proyecto-form-label">Categoría *</Form.Label>
                    <Form.Select
                      value={form.categoria}
                      onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                    >
                      <option value="">Elige una categoría</option>
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label className="proyecto-form-label">Nivel mínimo</Form.Label>
                    <Form.Select
                      value={form.nivel_minimo}
                      onChange={(e) => setForm((f) => ({ ...f, nivel_minimo: e.target.value }))}
                    >
                      {Object.entries(ETIQUETAS_NIVEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Tiempo estimado</Form.Label>
                <Form.Control
                  value={form.tiempo_estimado}
                  onChange={(e) => setForm((f) => ({ ...f, tiempo_estimado: e.target.value }))}
                  placeholder="Ej. 3 meses"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Etiquetas</Form.Label>
                <Form.Control
                  value={form.etiquetas}
                  onChange={(e) => setForm((f) => ({ ...f, etiquetas: e.target.value }))}
                  placeholder="Ej. hooks, componentes, jsx"
                />
                <Form.Text className="proyecto-form-ayuda">Separadas por comas.</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="¿Qué abarca esta habilidad?"
                />
              </Form.Group>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="proyecto-form-label">Popularidad (0-100)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      value={form.popularidad}
                      onChange={(e) => setForm((f) => ({ ...f, popularidad: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <Form.Check
                    type="checkbox"
                    id="habilidad-visible"
                    label="Visible en la plataforma"
                    checked={form.visible}
                    onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                  />
                </Col>
              </Row>
              <div className="d-flex gap-3">
                <Button type="submit" className="proyectos-boton" disabled={guardando}>
                  {guardando ? <Spinner animation="border" size="sm" /> : editando ? 'Guardar cambios' : 'Agregar habilidad'}
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

      <Modal
        show={!!confirmarBorrar}
        onHide={() => setConfirmarBorrar(null)}
        centered
        className="equipo-modal"
      >
        <Modal.Header closeButton className="equipo-modal-head">
          <Modal.Title className="proyectos-titulo">Eliminar habilidad</Modal.Title>
        </Modal.Header>
        <Modal.Body className="equipo-modal-body">
          <div className="d-flex flex-column align-items-center text-center py-3">
            <span className="confirmar-borrar-icono" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </span>
            <p className="mb-4" style={{ color: '#4f4a6d', maxWidth: '28rem' }}>
              ¿Seguro que deseas eliminar la habilidad{' '}
              <strong style={{ color: 'var(--nx-morado-oscuro)' }}>“{confirmarBorrar?.nombre}”</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="d-flex gap-3">
              <Button
                variant="outline-light"
                className="proyectos-boton"
                onClick={() => setConfirmarBorrar(null)}
              >
                Cancelar
              </Button>
              <Button
                className="proyectos-boton confirmar-borrar-btn"
                disabled={borrando === String(confirmarBorrar?._id)}
                onClick={confirmarBorrarAhora}
              >
                {borrando === String(confirmarBorrar?._id) ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  'Eliminar'
                )}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default HabilidadesPage;