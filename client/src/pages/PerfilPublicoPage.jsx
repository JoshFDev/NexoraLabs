import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import IconoHabilidad from '../components/IconoHabilidad';
import './PerfilPage.css';

const ROL_LABEL = {
  admin: 'Administrador',
  estudiante: 'Estudiante',
  desarrollador: 'Desarrollador',
  ingeniero: 'Ingeniero',
  mentor: 'Mentor / Docente',
};

const NIVEL_LABEL = {
  principiante: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
};

const DISP_LABEL = {
  tiempo_completo: 'Tiempo completo',
  medio_tiempo: 'Medio tiempo',
  fines_de_semana: 'Fines de semana',
  bajo_demanda: 'Bajo demanda',
};

const NIVEL_HABILIDAD = {
  principiante: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
};

const ICONOS_LOGROS = {
  crear_proyecto: 'rocket_launch',
  completar_perfil: 'how_to_reg',
  postularse: 'connect_without_contact',
  unirse_equipo: 'group',
  comentar: 'forum',
  calificar_recurso: 'school',
};

function PerfilPublicoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const miUsuario = JSON.parse(
    localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null'
  );

  const [perfil, setPerfil] = useState(null);
  const [habilidades, setHabilidades] = useState([]);
  const [logros, setLogros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const soyYo = perfil && miUsuario && String(perfil._id || perfil.id) === String(miUsuario._id || miUsuario.id);

  useEffect(() => {
    setCargando(true);
    setError('');
    Promise.all([
      api.get(`/usuario/${id}`),
      api.get(`/usuario/${id}/habilidades`).catch(() => ({ data: [] })),
      api.get(`/logros/usuario/${id}`).catch(() => ({ data: { logros: [] } })),
    ])
      .then(([resPerfil, resHabilidades, resLogros]) => {
        setPerfil(resPerfil.data);
        setHabilidades(resHabilidades.data || []);
        setLogros(resLogros.data?.logros || []);
      })
      .catch((err) => setError(err.response?.data?.error || 'No se encontró el usuario'))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="perfil-cargando">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <Button
          variant="link"
          className="mb-3 p-0 nav-link-nexora"
          style={{ fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </Button>

        {error || !perfil ? (
          <>
            <Alert variant="danger">{error || 'No se encontró el usuario'}</Alert>
            <Button variant="primary" className="proyectos-boton" as={Link} to="/explorar">
              Explorar proyectos
            </Button>
          </>
        ) : (
          <Row className="g-4">
            <Col xl={4} xxl={3}>
              <aside className="proyectos-filtros-panel perfil-resumen">
                <div className="perfil-foto" style={{ cursor: 'default' }}>
                  {perfil.foto ? (
                    <img className="perfil-foto-img" src={perfil.foto} alt="Foto de perfil" />
                  ) : (
                    <span className="perfil-foto-iniciales">
                      {(perfil.nombre || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="perfil-resumen-nombre">
                  {perfil.nombre || ''} {perfil.apellido_paterno || ''}{' '}
                  {perfil.apellido_materno || ''}
                </h1>
                <p className="perfil-rol">{ROL_LABEL[perfil.rol] || perfil.rol || 'Usuario'}</p>

                <div className="perfil-resumen-badges">
                  {perfil.pais && <span className="perfil-resumen-badge">{perfil.pais}</span>}
                  {perfil.provincia && <span className="perfil-resumen-badge">{perfil.provincia}</span>}
                  {perfil.especialidad_principal && (
                    <span className="perfil-resumen-badge">{perfil.especialidad_principal}</span>
                  )}
                  <span className="perfil-resumen-badge">
                    {NIVEL_LABEL[perfil.nivel_experiencia] || perfil.nivel_experiencia}
                  </span>
                  <span className="perfil-resumen-badge">
                    {DISP_LABEL[perfil.disponibilidad] || perfil.disponibilidad}
                  </span>
                </div>

                <hr className="perfil-resumen-sep" />

                {perfil.email && (
                  <div className="perfil-publico-linea">
                    <span className="perfil-publico-icono">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    {perfil.email}
                  </div>
                )}
                {perfil.telefono && (
                  <div className="perfil-publico-linea">
                    <span className="perfil-publico-icono">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    {perfil.telefono}
                  </div>
                )}

                {(perfil.redes_sociales?.github || perfil.redes_sociales?.linkedin || perfil.redes_sociales?.portafolio) && (
                  <>
                    <hr className="perfil-resumen-sep" />
                    <div className="perfil-publico-redes">
                      {perfil.redes_sociales.github && (
                        <a href={perfil.redes_sociales.github} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                      )}
                      {perfil.redes_sociales.linkedin && (
                        <a href={perfil.redes_sociales.linkedin} target="_blank" rel="noopener noreferrer">
                          LinkedIn
                        </a>
                      )}
                      {perfil.redes_sociales.portafolio && (
                        <a href={perfil.redes_sociales.portafolio} target="_blank" rel="noopener noreferrer">
                          Portafolio
                        </a>
                      )}
                    </div>
                  </>
                )}

                {soyYo && (
                  <div className="perfil-resumen-botones" style={{ marginTop: '1rem' }}>
                    <Button variant="outline-light" size="sm" className="proyectos-boton w-100" as={Link} to="/perfil">
                      Editar mi perfil
                    </Button>
                  </div>
                )}
              </aside>
            </Col>

            <Col xl={8} xxl={9}>
              <Row className="g-4">
                <Col xs={12}>
                  <section className="proyecto-panel perfil-panel">
                    <h2 className="perfil-card-titulo">Acerca de mí</h2>
                    {perfil.acerca_de_mi ? (
                      <p className="perfil-publico-texto">{perfil.acerca_de_mi}</p>
                    ) : (
                      <small className="proyectos-subtitulo">El usuario aún no añadió una descripción.</small>
                    )}
                  </section>
                </Col>

                <Col xs={12}>
                  <section className="proyecto-panel perfil-panel">
                    <h2 className="perfil-card-titulo">
                      Logros {logros.length > 0 && <span className="proyectos-subtitulo">· {logros.length}</span>}
                    </h2>
                    {logros.length === 0 ? (
                      <small className="proyectos-subtitulo">Aún no ha desbloqueado logros.</small>
                    ) : (
                      <div className="perfil-chips">
                        {logros.map((l) => (
                          <span
                            key={l.clave}
                            className="perfil-chip"
                            style={{ cursor: 'default', fontSize: '0.85rem', gap: '0.35rem', display: 'inline-flex', alignItems: 'center' }}
                            title={l.descripcion}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                              {ICONOS_LOGROS[l.tipo] || 'workspace_premium'}
                            </span>
                            <span>{l.nombre}</span>
                            {l.fecha_obtencion && (
                              <span className="perfil-publico-nivel">
                                {new Date(l.fecha_obtencion).toLocaleDateString('es')}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>
                </Col>

                <Col xs={12}>
                  <section className="proyecto-panel perfil-panel">
                    <h2 className="perfil-card-titulo">Habilidades</h2>
                    {habilidades.length === 0 ? (
                      <small className="proyectos-subtitulo">Aún no ha declarado habilidades.</small>
                    ) : (
                      <div className="perfil-publico-habilidades">
                        {habilidades.map((r) => {
                          const h = r.habilidad_id;
                          return (
                            <span key={String(r._id)} className="proyecto-chip-habilidad seleccionada" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'default' }}>
                              <IconoHabilidad nombre={h?.nombre || 'Habilidad'} />
                              {h?.nombre || 'Habilidad'}
                              <span className="perfil-publico-nivel">
                                {NIVEL_HABILIDAD[r.nivel] || r.nivel || 'Básico'}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </Col>

                <Col md={6}>
                  <section className="proyecto-panel perfil-panel h-100">
                    <h2 className="perfil-card-titulo">Intereses</h2>
                    {perfil.intereses?.length ? (
                      <div className="perfil-chips">
                        {perfil.intereses.map((i) => (
                          <span key={i} className="perfil-chip" style={{ cursor: 'default' }}>{i}</span>
                        ))}
                      </div>
                    ) : (
                      <small className="proyectos-subtitulo">Sin intereses registrados.</small>
                    )}
                  </section>
                </Col>

                <Col md={6}>
                  <section className="proyecto-panel perfil-panel h-100">
                    <h2 className="perfil-card-titulo">Idiomas</h2>
                    {perfil.idiomas?.length ? (
                      <div className="perfil-chips">
                        {perfil.idiomas.map((i) => (
                          <span key={i} className="perfil-chip" style={{ cursor: 'default' }}>{i}</span>
                        ))}
                      </div>
                    ) : (
                      <small className="proyectos-subtitulo">Sin idiomas registrados.</small>
                    )}
                  </section>
                </Col>

                <Col xs={12}>
                  <section className="proyecto-panel perfil-panel">
                    <h2 className="perfil-card-titulo">Educación</h2>
                    {perfil.educacion?.institucion || perfil.educacion?.titulo ? (
                      <div className="perfil-publico-educacion">
                        <strong>{perfil.educacion.titulo || 'Carrera no especificada'}</strong>
                        {perfil.educacion.institucion && (
                          <div className="proyectos-subtitulo">{perfil.educacion.institucion}</div>
                        )}
                        {perfil.educacion.en_curso && (
                          <span className="perfil-resumen-badge" style={{ marginTop: '0.35rem' }}>
                            En curso
                          </span>
                        )}
                      </div>
                    ) : (
                      <small className="proyectos-subtitulo">Sin formación registrada.</small>
                    )}
                  </section>
                </Col>
              </Row>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default PerfilPublicoPage;