import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import api from '../api';
import IconoHabilidad from '../components/IconoHabilidad';
import { leerUsuario } from '../utils/perfil';
import './ProyectosPage.css';

const TIPOS = ['empleo', 'practica', 'voluntariado'];
const ETIQUETAS_TIPO = { empleo: 'Empleo', practica: 'Práctica', voluntariado: 'Voluntariado' };
const MODALIDADES = ['remoto', 'hibrido', 'presencial'];
const ETIQUETAS_MODALIDAD = { remoto: 'Remoto', hibrido: 'Híbrido', presencial: 'Presencial' };
const NIVELES = ['principiante', 'intermedio', 'avanzado', 'experto'];
const ETIQUETAS_NIVEL = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado', experto: 'Experto' };
const ETIQUETAS_ESTADO = { abierta: 'Abierta', cerrada: 'Cerrada', cancelada: 'Cancelada' };
const ETIQUETAS_POS = { pendiente: 'Pendiente', aceptada: 'Aceptada', rechazada: 'Rechazada', cancelada: 'Cancelada' };

function OfertasEmpleoPage() {
  const usuario = leerUsuario();
  const puedePublicar = usuario && ['admin', 'mentor'].includes(usuario.rol);
  const idUsuario = String(usuario?._id || usuario?.id || '');

  const [ofertas, setOfertas] = useState([]);
  const [misPostulaciones, setMisPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({ busqueda: '', tipo: '', modalidad: '', nivel: '' });

  const [habilidades, setHabilidades] = useState([]);
  const [showPublicar, setShowPublicar] = useState(false);
  const [formOferta, setFormOferta] = useState({ titulo: '', empresa: '', descripcion: '', tipo: 'empleo', modalidad: 'remoto', ubicacion: '', salario: '', nivel: 'intermedio', fecha_limite: '' });
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [buscarHabilidad, setBuscarHabilidad] = useState('');
  const [cargandoGuardar, setCargandoGuardar] = useState(false);

  const [postularOferta, setPostularOferta] = useState(null);
  const [mensajePostulacion, setMensajePostulacion] = useState('');
  const [cargandoPost, setCargandoPost] = useState(false);

  const [viewOferta, setViewOferta] = useState(null);
  const [postulantes, setPostulantes] = useState(null);
  const [cargandoPostulantes, setCargandoPostulantes] = useState(false);

  const cargarOfertas = () => {
    setCargando(true);
    const params = new URLSearchParams({ limite: '50' });
    if (filtros.busqueda) params.set('busqueda', filtros.busqueda);
    if (filtros.tipo) params.set('tipo', filtros.tipo);
    if (filtros.modalidad) params.set('modalidad', filtros.modalidad);
    if (filtros.nivel) params.set('nivel', filtros.nivel);
    if (!puedePublicar) params.set('estado', 'abierta');
    api
      .get(`/ofertas?${params}`)
      .then((res) => setOfertas(res.data.ofertas || []))
      .catch((err) => setError(err.response?.data?.error || 'No pudimos cargar las ofertas.'))
      .finally(() => setCargando(false));
  };

  const cargarMisPostulaciones = () => {
    api
      .get('/mis-postulaciones-ofertas')
      .then((res) => setMisPostulaciones(res.data || []))
      .catch(() => setMisPostulaciones([]));
  };

  useEffect(() => {
    cargarMisPostulaciones();
    api
      .get('/habilidades?limite=500')
      .then((res) => setHabilidades(res.data.habilidades || []))
      .catch(() => setHabilidades([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargarOfertas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, puedePublicar]);

  const ofertasAbiertas = ofertas.filter((o) => o.estado === 'abierta');
  const misOfertas = puedePublicar ? ofertas.filter((o) => String(o.publicado_por?._id || o.publicado_por) === idUsuario) : [];

  const publicarOferta = async (e) => {
    e.preventDefault();
    setError('');
    if (formOferta.titulo.trim().length < 5) {
      setError('El título debe tener al menos 5 caracteres.');
      return;
    }
    if (formOferta.descripcion.trim().length < 20) {
      setError('La descripción debe tener al menos 20 caracteres.');
      return;
    }
    setCargandoGuardar(true);
    try {
      await api.post('/oferta/agregar', {
        ...formOferta,
        habilidades_requeridas: seleccionadas,
        fecha_limite: formOferta.fecha_limite || undefined,
      });
      setShowPublicar(false);
      setFormOferta({ titulo: '', empresa: '', descripcion: '', tipo: 'empleo', modalidad: 'remoto', ubicacion: '', salario: '', nivel: 'intermedio', fecha_limite: '' });
      setSeleccionadas([]);
      cargarOfertas();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos publicar la oferta.');
    } finally {
      setCargandoGuardar(false);
    }
  };

  const postular = async () => {
    if (!postularOferta) return;
    setCargandoPost(true);
    setError('');
    try {
      await api.post(`/oferta/${postularOferta._id}/postular`, { mensaje: mensajePostulacion });
      setPostularOferta(null);
      setMensajePostulacion('');
      cargarMisPostulaciones();
      cargarOfertas();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo postular');
      setPostularOferta(null);
    } finally {
      setCargandoPost(false);
    }
  };

  const retirarPostulacion = async (p) => {
    if (!window.confirm('¿Retirar tu postulación a esta oferta?')) return;
    try {
      await api.delete(`/postulacion-oferta-own/${p._id}`);
      cargarMisPostulaciones();
      cargarOfertas();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos retirar la postulación.');
    }
  };

  const cambiarEstadoOferta = async (o, estado) => {
    if (!window.confirm(`¿Cambiar esta oferta a "${ETIQUETAS_ESTADO[estado]}"?`)) return;
    try {
      await api.put(`/oferta/${o._id}`, { estado });
      cargarOfertas();
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos actualizar la oferta.');
    }
  };

  const verPostulaciones = async (o) => {
    setViewOferta(o);
    setPostulantes(null);
    setCargandoPostulantes(true);
    try {
      const res = await api.get(`/oferta/${o._id}/postulaciones`);
      setPostulantes(res.data || []);
    } catch (err) {
      setPostulantes([]);
      setError(err.response?.data?.error || 'No pudimos cargar las postulaciones.');
    } finally {
      setCargandoPostulantes(false);
    }
  };

  const responderPostulacion = async (p, estado) => {
    try {
      await api.put(`/postulacion-oferta/${p._id}/estado`, { estado });
      if (viewOferta) verPostulaciones(viewOferta);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos responder la postulación.');
    }
  };

  const estadoBadge = (estado) => (
    <span className={`proyecto-badge oferta-badge-${estado}`}>
      {ETIQUETAS_POS[estado] || estado}
    </span>
  );

  const rendCard = (o, gestion = false) => (
    <article className="proyecto-fila" key={o._id}>
      <div className="proyecto-fila-cabecera">
        <div>
          <h3 className="proyecto-titulo-tarjeta mb-1">{o.titulo}</h3>
          {o.empresa && <span className="proyectos-subtitulo">{o.empresa}</span>}
        </div>
        <span className="proyecto-fila-flecha">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      <div className="proyecto-meta mb-2">
        <span className="proyecto-badge">{ETIQUETAS_ESTADO[o.estado] || o.estado}</span>
        <span className="proyecto-badge">{ETIQUETAS_TIPO[o.tipo] || o.tipo}</span>
        <span className="proyecto-badge">{ETIQUETAS_MODALIDAD[o.modalidad] || o.modalidad}</span>
        <span className="proyecto-badge">{ETIQUETAS_NIVEL[o.nivel] || o.nivel}</span>
        {o.ubicacion && <span className="proyecto-badge">{o.ubicacion}</span>}
        {o.salario && <span className="proyecto-badge">{o.salario}</span>}
      </div>
      <p className="proyecto-descripcion">{o.descripcion}</p>
      {o.habilidades_requeridas?.length > 0 && (
        <div className="proyecto-detalle-chips mb-2">
          {o.habilidades_requeridas.map((h) => (
            <span key={String(h._id || h)} className="proyecto-detalle-chip">
              <IconoHabilidad nombre={h.nombre || h} />
              {h.nombre || h}
            </span>
          ))}
        </div>
      )}
      <footer className="proyecto-creador">
        {o.publicado_por?.nombre || 'NexoraLabs'} · {new Date(o.fecha_publicacion).toLocaleDateString('es')}
        {o.fecha_limite && ` · Cierra el ${new Date(o.fecha_limite).toLocaleDateString('es')}`}
      </footer>

      <div className="proyecto-detalle-acciones">
        {gestion ? (
          <>
            <Button size="sm" variant="primary" className="proyectos-boton" onClick={() => verPostulaciones(o)}>
              Ver postulaciones
            </Button>
            {o.estado === 'abierta' && (
              <Button size="sm" variant="outline-light" className="proyectos-boton" onClick={() => cambiarEstadoOferta(o, 'cerrada')}>
                Cerrar oferta
              </Button>
            )}
            {o.estado !== 'abierta' && (
              <Button size="sm" variant="outline-light" className="proyectos-boton" onClick={() => cambiarEstadoOferta(o, 'abierta')}>
                Reabrir oferta
              </Button>
            )}
          </>
        ) : o.estado !== 'abierta' ? (
          estadoBadge(o.estado)
        ) : o._miestado === 'no_aplicada' || !o._miestado ? (
          <Button size="sm" variant="primary" className="proyectos-boton" onClick={() => setPostularOferta(o)}>
            Postularme
          </Button>
        ) : (
          estadoBadge(o._miestado)
        )}
      </div>
    </article>
  );

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            <h2 className="proyectos-titulo mb-0">Ofertas y oportunidades</h2>
            <p className="proyectos-subtitulo mb-0">
              Empleos, prácticas y voluntariados para la comunidad.
            </p>
          </div>
          {puedePublicar && (
            <Button className="proyectos-boton" onClick={() => setShowPublicar(true)}>
              Publicar oferta
            </Button>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="g-4">
          <Col xl={3}>
            <aside className="proyectos-filtros-panel">
              <strong className="d-block mb-3">Filtrar</strong>
              <Form.Group className="mb-3">
                <Form.Control
                  type="search"
                  placeholder="Buscar por título, empresa…"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros((f) => ({ ...f, busqueda: e.target.value }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Select value={filtros.tipo} onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}>
                  <option value="">Todos</option>
                  {TIPOS.map((t) => <option key={t} value={t}>{ETIQUETAS_TIPO[t]}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Modalidad</Form.Label>
                <Form.Select value={filtros.modalidad} onChange={(e) => setFiltros((f) => ({ ...f, modalidad: e.target.value }))}>
                  <option value="">Todas</option>
                  {MODALIDADES.map((m) => <option key={m} value={m}>{ETIQUETAS_MODALIDAD[m]}</option>)}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nivel</Form.Label>
                <Form.Select value={filtros.nivel} onChange={(e) => setFiltros((f) => ({ ...f, nivel: e.target.value }))}>
                  <option value="">Todos</option>
                  {NIVELES.map((n) => <option key={n} value={n}>{ETIQUETAS_NIVEL[n]}</option>)}
                </Form.Select>
              </Form.Group>
            </aside>
          </Col>

          <Col xl={9}>
            {cargando ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="light" />
              </div>
            ) : ofertasAbiertas.length === 0 && misPostulaciones.length === 0 ? (
              <p className="proyectos-vacio">Aún no hay ofertas publicadas. ¡Vuelve pronto!</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {ofertasAbiertas.map((o) => rendCard(o))}
                {ofertasAbiertas.length === 0 && <p className="proyectos-vacio">No hay ofertas que coincidan con tus filtros.</p>}
              </div>
            )}
          </Col>
        </Row>

        {misPostulaciones.length > 0 && (
          <section className="mt-5">
            <h3 className="proyectos-titulo mb-3" style={{ fontSize: '1.1rem' }}>Mis postulaciones</h3>
            <div className="d-flex flex-column gap-3">
              {misPostulaciones.map((p) => (
                <div className="proyecto-fila" key={p._id}>
                  <div className="proyecto-fila-cabecera">
                    <div>
                      <h4 className="proyecto-titulo-tarjeta mb-1">{p.oferta_id?.titulo || 'Oferta'}</h4>
                      {p.oferta_id?.empresa && <span className="proyectos-subtitulo">{p.oferta_id.empresa}</span>}
                    </div>
                    {estadoBadge(p.estado)}
                  </div>
                  {p.mensaje && <p className="proyecto-descripcion">"{p.mensaje}"</p>}
                  <footer className="proyecto-creador">
                    Postulada el {new Date(p.fecha).toLocaleDateString('es')}
                  </footer>
                  <div className="proyecto-detalle-acciones">
                    {p.estado === 'pendiente' && (
                      <Button size="sm" variant="outline-danger" className="proyectos-boton" onClick={() => retirarPostulacion(p)}>
                        Retirar postulación
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {puedePublicar && misOfertas.length > 0 && (
          <section className="mt-5">
            <h3 className="proyectos-titulo mb-3" style={{ fontSize: '1.1rem' }}>Mis ofertas publicadas</h3>
            <div className="d-flex flex-column gap-3">
              {misOfertas.map((o) => rendCard(o, true))}
            </div>
          </section>
        )}
      </Container>

      <Modal show={showPublicar} onHide={() => setShowPublicar(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="proyectos-titulo">Publicar oferta</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form onSubmit={publicarOferta}>
            <Row className="g-3">
              <Col md={7}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Título del puesto *</Form.Label>
                  <Form.Control value={formOferta.titulo} onChange={(e) => setFormOferta((f) => ({ ...f, titulo: e.target.value }))} placeholder="Ej. Desarrollador Full Stack" />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Empresa</Form.Label>
                  <Form.Control value={formOferta.empresa} onChange={(e) => setFormOferta((f) => ({ ...f, empresa: e.target.value }))} placeholder="Ej. TechCorp" />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Descripción *</Form.Label>
                  <Form.Control as="textarea" rows={4} value={formOferta.descripcion} onChange={(e) => setFormOferta((f) => ({ ...f, descripcion: e.target.value }))} placeholder="Responsabilidades, requisitos, beneficios…" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Tipo</Form.Label>
                  <Form.Select value={formOferta.tipo} onChange={(e) => setFormOferta((f) => ({ ...f, tipo: e.target.value }))}>
                    {TIPOS.map((t) => <option key={t} value={t}>{ETIQUETAS_TIPO[t]}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Modalidad</Form.Label>
                  <Form.Select value={formOferta.modalidad} onChange={(e) => setFormOferta((f) => ({ ...f, modalidad: e.target.value }))}>
                    {MODALIDADES.map((m) => <option key={m} value={m}>{ETIQUETAS_MODALIDAD[m]}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Nivel</Form.Label>
                  <Form.Select value={formOferta.nivel} onChange={(e) => setFormOferta((f) => ({ ...f, nivel: e.target.value }))}>
                    {NIVELES.map((n) => <option key={n} value={n}>{ETIQUETAS_NIVEL[n]}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Ubicación</Form.Label>
                  <Form.Control value={formOferta.ubicacion} onChange={(e) => setFormOferta((f) => ({ ...f, ubicacion: e.target.value }))} placeholder="Ciudad / País" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Salario / rango</Form.Label>
                  <Form.Control value={formOferta.salario} onChange={(e) => setFormOferta((f) => ({ ...f, salario: e.target.value }))} placeholder="Ej. $1,500–$2,000" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Fecha límite</Form.Label>
                  <Form.Control type="date" value={formOferta.fecha_limite} onChange={(e) => setFormOferta((f) => ({ ...f, fecha_limite: e.target.value }))} />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-2">
                  <Form.Label className="proyecto-form-label">Habilidades requeridas</Form.Label>
                  <Form.Control type="search" placeholder="Buscar habilidades…" value={buscarHabilidad} onChange={(e) => setBuscarHabilidad(e.target.value)} className="mb-2" />
                  <div className="proyecto-habilidades-chips">
                    {habilidades
                      .filter((h) => h.nombre.toLowerCase().includes(buscarHabilidad.trim().toLowerCase()))
                      .map((h) => (
                        <button
                          type="button"
                          key={h._id}
                          className={`proyecto-chip-habilidad ${seleccionadas.includes(h._id) ? 'seleccionada' : ''}`}
                          onClick={() => setSeleccionadas((s) => (s.includes(h._id) ? s.filter((x) => x !== h._id) : [...s, h._id]))}
                        >
                          <IconoHabilidad nombre={h.nombre} />
                          {h.nombre}
                        </button>
                      ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="outline-light" className="proyectos-boton" onClick={() => setShowPublicar(false)}>Cancelar</Button>
              <Button variant="primary" type="submit" className="proyectos-boton" disabled={cargandoGuardar}>
                {cargandoGuardar ? <Spinner animation="border" size="sm" /> : 'Publicar oferta'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={!!postularOferta} onHide={() => setPostularOferta(null)} centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="proyectos-titulo">Postularme a "{postularOferta?.titulo}"</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form.Group className="mb-3">
            <Form.Label className="proyecto-form-label">¿Por qué encajas en esta oportunidad?</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={mensajePostulacion}
              onChange={(e) => setMensajePostulacion(e.target.value)}
              placeholder="Cuéntale a quien publica por qué eres buen candidato…"
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-light" className="proyectos-boton" onClick={() => setPostularOferta(null)}>Cancelar</Button>
            <Button variant="primary" className="proyectos-boton" onClick={postular} disabled={cargandoPost}>
              {cargandoPost ? <Spinner animation="border" size="sm" /> : 'Enviar postulación'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={!!viewOferta} onHide={() => setViewOferta(null)} size="lg" scrollable centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="proyectos-titulo">Postulaciones · {viewOferta?.titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          {cargandoPostulantes ? (
            <div className="text-center py-4"><Spinner animation="border" variant="light" /></div>
          ) : !postulantes || postulantes.length === 0 ? (
            <p className="proyectos-vacio">Todavía no hay postulaciones para esta oferta.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {postulantes.map((p) => (
                <div className="proyecto-fila" key={p._id}>
                  <div className="proyecto-fila-cabecera">
                    <div>
                      <h4 className="proyecto-titulo-tarjeta mb-0">
                        {p.usuario_id?.nombre || 'Usuario'}
                      </h4>
                      <span className="proyectos-subtitulo">
                        {p.usuario_id?.rol} · {p.usuario_id?.especialidad_principal || 'Sin especialidad'}
                        {p.usuario_id?.pais ? ` · ${p.usuario_id.pais}` : ''}
                      </span>
                    </div>
                    {estadoBadge(p.estado)}
                  </div>
                  {p.mensaje && <p className="proyecto-descripcion">"{p.mensaje}"</p>}
                  <footer className="proyecto-creador">
                    {p.usuario_id?.email} · {new Date(p.fecha).toLocaleDateString('es')}
                  </footer>
                  {p.estado === 'pendiente' && (
                    <div className="proyecto-detalle-acciones">
                      <Button size="sm" variant="primary" className="proyectos-boton" onClick={() => responderPostulacion(p, 'aceptada')}>
                        Aceptar
                      </Button>
                      <Button size="sm" variant="outline-danger" className="proyectos-boton" onClick={() => responderPostulacion(p, 'rechazada')}>
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default OfertasEmpleoPage;