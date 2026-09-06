import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Chispas from '../components/Chispas';
import { leerUsuario } from '../utils/perfil';
import './ProyectosPage.css';

const ROLES_CREADOR = ['admin', 'mentor', 'desarrollador', 'ingeniero'];

const NIVELES = ['principiante', 'intermedio', 'avanzado', 'experto'];
const ESTADOS = ['borrador', 'buscando_equipo', 'en_desarrollo'];
const CATEGORIAS = ['web', 'movil', 'ia', 'backend', 'frontend', 'devops', 'big_data', 'diseno', 'otro'];

function CrearProyectoPage() {
  const usuario = leerUsuario();
  const puedeCrear = ROLES_CREADOR.includes(usuario?.rol);
  const navigate = useNavigate();

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
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [cargandoHabilidades, setCargandoHabilidades] = useState(true);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/habilidades?limite=100')
      .then((res) => setHabilidades(res.data.habilidades || []))
      .catch(() => setHabilidades([]))
      .finally(() => setCargandoHabilidades(false));
  }, []);

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
    setCargando(true);
    try {
      await api.post('/proyecto/agregar', {
        ...form,
        creador_id: usuario.id,
        fecha_limite: form.fecha_limite || undefined,
        habilidades_requeridas: seleccionadas,
        integrantes_maximos: Number(form.integrantes_maximos),
      });
      setExito(true);
      setCargando(false);
      setTimeout(() => navigate('/explorar'), 750);
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos crear el proyecto.');
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
    <div className="proyectos-pagina">
      <Container className="pt-4" style={{ maxWidth: 780 }}>
        <h2 className="proyectos-titulo mb-1">Crear proyecto</h2>
        <p className="proyectos-subtitulo mb-4">Publica tu idea y encuentra con quién construirla.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        {exito && (
          <div className="proyectos-bloqueo" style={{ margin: '2rem auto' }}>
            <span className="dash-bloqueo-icono" style={{ color: '#34d399' }}>✓</span>
            <h2>¡Proyecto publicado!</h2>
            <p>Tu proyecto ya está en la plataforma.</p>
          </div>
        )}
        {exito && <Chispas />}

        {!exito && (
          <div className="proyecto-panel">
            <Form onSubmit={submit} className="proyecto-form" noValidate>
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
                  rows={4}
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
                    <Form.Label className="proyecto-form-label">Estado inicial</Form.Label>
                    <Form.Select value={form.estado} onChange={(e) => cambiar('estado', e.target.value)}>
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>{s}</option>
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

              <Form.Group className="mb-3">
                <Form.Label className="proyecto-form-label">Habilidades requeridas</Form.Label>
                {cargandoHabilidades ? (
                  <Spinner animation="border" size="sm" variant="light" />
                ) : habilidades.length === 0 ? (
                  <div className="proyecto-error-campo">No hay habilidades disponibles para elegir.</div>
                ) : (
                  <div className="proyecto-habilidades-chips">
                    {habilidades.map((h) => (
                      <button
                        type="button"
                        key={h._id}
                        className={`proyecto-chip-habilidad ${seleccionadas.includes(h._id) ? 'seleccionada' : ''}`}
                        onClick={() => alternarHabilidad(h._id)}
                      >
                        {h.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="proyecto-form-label">Fecha límite</Form.Label>
                <Form.Control
                  type="date"
                  value={form.fecha_limite}
                  onChange={(e) => cambiar('fecha_limite', e.target.value)}
                />
              </Form.Group>

              <div className="d-flex gap-3">
                <Button variant="primary" type="submit" className="proyectos-boton" disabled={cargando}>
                  {cargando ? <Spinner animation="border" size="sm" /> : 'Publicar proyecto'}
                </Button>
                <Button variant="outline-light" className="proyectos-boton" as={Link} to="/explorar">
                  Cancelar
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Container>
    </div>
  );
}

export default CrearProyectoPage;