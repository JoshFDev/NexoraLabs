import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import Chispas from '../components/Chispas';
import IconoHabilidad from '../components/IconoHabilidad';
import { leerUsuario } from '../utils/perfil';
import './ProyectosPage.css';

const ROLES_CREADOR = ['admin', 'mentor', 'desarrollador', 'ingeniero'];

const NIVELES = ['principiante', 'intermedio', 'avanzado', 'experto'];
const ESTADOS = ['borrador', 'buscando_equipo', 'en_desarrollo'];
const ESTADOS_EDITAR = [...ESTADOS, 'finalizado', 'cancelado'];
const ETIQUETAS_ESTADO_CREAR = {
  borrador: 'Borrador',
  buscando_equipo: 'Buscando equipo',
  en_desarrollo: 'En desarrollo',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};
const CATEGORIAS = ['web', 'movil', 'ia', 'backend', 'frontend', 'devops', 'big_data', 'diseno', 'otro'];

function CrearProyectoPage() {
  const usuario = leerUsuario();
  const puedeCrear = ROLES_CREADOR.includes(usuario?.rol);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editar');
  const esEdicion = Boolean(editId);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    nivel_dificultad: 'intermedio',
    estado: 'buscando_equipo',
    integrantes_maximos: 3,
    fecha_limite: '',
  });
  const [habilidades, setHabilidades] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [buscarHabilidad, setBuscarHabilidad] = useState('');
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [cargandoHabilidades, setCargandoHabilidades] = useState(true);
  const [cargandoProyecto, setCargandoProyecto] = useState(esEdicion);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/habilidades?limite=100')
      .then((res) => setHabilidades(res.data.habilidades || []))
      .catch(() => setHabilidades([]))
      .finally(() => setCargandoHabilidades(false));
  }, []);

  useEffect(() => {
    if (!editId) return;
    let activo = true;
    setError('');
    api
      .get(`/proyecto/${editId}`)
      .then((res) => {
        const p = res.data;
        setForm({
          titulo: p.titulo || '',
          descripcion: p.descripcion || '',
          categoria: p.categoria || '',
          nivel_dificultad: p.nivel_dificultad || 'intermedio',
          estado: p.estado || 'buscando_equipo',
          integrantes_maximos: p.integrantes_maximos || 3,
          fecha_limite: p.fecha_limite ? p.fecha_limite.slice(0, 10) : '',
        });
        if (Array.isArray(p.habilidades_requeridas)) {
          setSeleccionadas(p.habilidades_requeridas.map((h) => (typeof h === 'string' ? h : h._id)));
        }
      })
      .catch((err) => {
        if (activo) setError(err.response?.data?.error || 'No pudimos cargar el proyecto.');
      })
      .finally(() => {
        if (activo) setCargandoProyecto(false);
      });
    return () => {
      activo = false;
    };
  }, [editId]);

  const cambiar = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: '' }));
  };

  const alternarHabilidad = (id) => {
    setSeleccionadas((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const validar = () => {
    const campos = {};
    if (form.titulo.trim().length < 5) campos.titulo = 'Mínimo 5 caracteres.';
    if (form.descripcion.trim().length < 20) campos.descripcion = 'Escribe una descripción de al menos 20 caracteres.';
    if (Number(form.integrantes_maximos) < 1) campos.integrantes_maximos = 'Mínimo 1 integrante.';
    return campos;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const campos = validar();
    if (Object.keys(campos).length) {
      setErrores(campos);
      return;
    }
    if (esEdicion && ['finalizado', 'cancelado'].includes(form.estado)) {
      const accion = form.estado === 'finalizado' ? 'finalizar' : 'cancelar';
      if (!window.confirm(`¿Seguro que quieres ${accion} este proyecto?`)) return;
    }
    setCargando(true);
    try {
      const datos = {
        ...form,
        creador_id: usuario._id || usuario.id,
        fecha_limite: form.fecha_limite || undefined,
        habilidades_requeridas: seleccionadas,
        integrantes_maximos: Number(form.integrantes_maximos),
      };
      if (esEdicion) {
        await api.put(`/proyecto/${editId}`, datos);
      } else {
        await api.post('/proyecto/agregar', datos);
      }
      setExito(true);
      setCargando(false);
      setTimeout(() => (esEdicion ? navigate(`/proyecto/${editId}`) : navigate('/explorar')), 750);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos guardar el proyecto.');
      setCargando(false);
    }
  };

  if (!puedeCrear) {
    return (
      <div className="proyectos-pagina">
        <Container>
          <div className="proyectos-bloqueo">
            <span className="dash-bloqueo-icono">!</span>
            <h2>Solo roles de creación</h2>
            <p>
              Tu perfil ({usuario?.rol || 'estudiante'}) no tiene permisos para publicar proyectos. Los roles
              mentor, desarrollador e ingeniero pueden crear. Mientras tanto, explora y postúlate a los que te interesen.
            </p>
            <Button variant="primary" className="proyectos-boton" as={Link} to="/explorar">
              Explorar proyectos
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="proyectos-pagina crear-proyecto-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <h2 className="proyectos-titulo mb-1">{esEdicion ? 'Editar proyecto' : 'Crear proyecto'}</h2>
        <p className="proyectos-subtitulo mb-4">
          {esEdicion
            ? 'Actualiza la información o el estado de tu proyecto.'
            : 'Publica tu idea y encuentra con quién construirla.'}
        </p>

        {error && <Alert variant="danger">{error}</Alert>}

        {exito && (
          <div className="proyectos-bloqueo" style={{ margin: '2rem auto' }}>
            <span className="dash-bloqueo-icono" style={{ color: '#34d399' }}>✓</span>
            <h2>{esEdicion ? '¡Proyecto actualizado!' : '¡Proyecto publicado!'}</h2>
            <p>{esEdicion ? 'Los cambios se guardaron correctamente.' : 'Tu proyecto ya está en la plataforma.'}</p>
          </div>
        )}
        {exito && <Chispas />}

        {!exito && cargandoProyecto && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
            <p className="proyectos-subtitulo mt-2">Cargando proyecto…</p>
          </div>
        )}

        {!exito && !cargandoProyecto && (
          <Form onSubmit={submit} className="proyecto-form crear-form" noValidate>
            <Row className="g-4 h-100">
              <Col lg={8}>
                <div className="proyecto-panel crear-panel">
                  <Form.Group className="mb-3">
                    <Form.Label className="proyecto-form-label">Título del proyecto *</Form.Label>
                    <Form.Control
                      value={form.titulo}
                      onChange={(e) => cambiar('titulo', e.target.value)}
                      className={errores.titulo ? 'error' : ''}
                      placeholder="Ej. App de mentoría para estudiantes"
                      isInvalid={!!errores.titulo}
                    />
                    {errores.titulo && <div className="proyecto-error-campo">{errores.titulo}</div>}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="proyecto-form-label">Descripción *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={form.descripcion}
                      onChange={(e) => cambiar('descripcion', e.target.value)}
                      className={errores.descripcion ? 'error' : ''}
                      placeholder="¿Qué vas a construir, para quién y qué necesitas?"
                      isInvalid={!!errores.descripcion}
                    />
                    {errores.descripcion && <div className="proyecto-error-campo">{errores.descripcion}</div>}
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="proyecto-form-label">Categoría</Form.Label>
                        <Form.Select value={form.categoria} onChange={(e) => cambiar('categoria', e.target.value)}>
                          <option value="">Sin categoría</option>
                          {CATEGORIAS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="proyecto-form-label">Nivel de dificultad</Form.Label>
                        <Form.Select value={form.nivel_dificultad} onChange={(e) => cambiar('nivel_dificultad', e.target.value)}>
                          {NIVELES.map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="proyecto-form-label">{esEdicion ? 'Estado del proyecto' : 'Estado inicial'}</Form.Label>
<Form.Select value={form.estado} onChange={(e) => cambiar('estado', e.target.value)}>
                        {(esEdicion ? ESTADOS_EDITAR : ESTADOS).map((s) => (
                          <option key={s} value={s}>{ETIQUETAS_ESTADO_CREAR[s] || s}</option>
                        ))}
                      </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="proyecto-form-label">Integrantes máximos</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="20"
                          value={form.integrantes_maximos}
                          onChange={(e) => cambiar('integrantes_maximos', e.target.value)}
                          className={errores.integrantes_maximos ? 'error' : ''}
                          isInvalid={!!errores.integrantes_maximos}
                        />
                        {errores.integrantes_maximos && (
                          <div className="proyecto-error-campo">{errores.integrantes_maximos}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </Col>

              <Col lg={4}>
                <div className="proyecto-panel proyectos-panel-lateral crear-panel">
                  <Form.Group className="mb-3">
                    <Form.Label className="proyecto-form-label">Habilidades requeridas</Form.Label>
                    {cargandoHabilidades ? (
                      <Spinner animation="border" size="sm" variant="light" />
                    ) : habilidades.length === 0 ? (
                      <div className="proyecto-error-campo">No hay habilidades disponibles para elegir.</div>
                    ) : (
                      <>
                        <div className="proyecto-habilidades-buscar">
                          <Form.Control
                            type="search"
                            placeholder="Buscar habilidades…"
                            value={buscarHabilidad}
                            onChange={(e) => setBuscarHabilidad(e.target.value)}
                          />
                        </div>
                        <div className="proyecto-habilidades-chips">
                          {habilidades
                            .filter((h) =>
                              h.nombre.toLowerCase().includes(buscarHabilidad.trim().toLowerCase())
                            )
                            .map((h) => (
                              <button
                                type="button"
                                key={h._id}
                                className={`proyecto-chip-habilidad ${seleccionadas.includes(h._id) ? 'seleccionada' : ''}`}
                                onClick={() => alternarHabilidad(h._id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                              >
                                <IconoHabilidad nombre={h.nombre} />
                                {h.nombre}
                              </button>
                            ))}
                          {habilidades.filter((h) =>
                            h.nombre.toLowerCase().includes(buscarHabilidad.trim().toLowerCase())
                          ).length === 0 && (
                            <div className="proyecto-error-campo">Sin resultados para tu búsqueda.</div>
                          )}
                        </div>
                      </>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="proyecto-form-label">Fecha límite de postulación</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.fecha_limite}
                      onChange={(e) => cambiar('fecha_limite', e.target.value)}
                    />
                    <Form.Text className="proyecto-form-ayuda">
                      Hasta cuándo podrán postularse los interesados. Si no pones fecha, no habrá límite.
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button variant="primary" type="submit" className="proyectos-boton" disabled={cargando}>
                      {cargando ? <Spinner animation="border" size="sm" /> : esEdicion ? 'Guardar cambios' : 'Publicar proyecto'}
                    </Button>
                    <Button variant="outline-light" className="proyectos-boton" as={Link} to="/explorar">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        )}
      </Container>
    </div>
  );
}

export default CrearProyectoPage;