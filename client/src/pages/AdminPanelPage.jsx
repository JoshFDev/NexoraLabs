import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';
import './ProyectosPage.css';

const ETIQUETAS_ROL = {
  admin: 'Admin',
  mentor: 'Mentor',
  estudiante: 'Estudiante',
  desarrollador: 'Desarrollador',
  ingeniero: 'Ingeniero',
};

const ETIQUETAS_ESTADO = {
  borrador: 'Borrador',
  buscando_equipo: 'Buscando equipo',
  en_desarrollo: 'En desarrollo',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

const ETIQUETAS_ESTADO_EQUIPO = {
  activo: 'Activo',
  finalizado: 'Finalizado',
  disuelto: 'Disuelto',
};

const ETIQUETAS_TIPO = {
  curso: 'Curso',
  documentación: 'Documentación',
  video: 'Video',
  artículo: 'Artículo',
  libro: 'Libro',
};

const maxDe = (arr) => arr.reduce((m, x) => Math.max(m, x.cantidad), 0);

function Barra({ etiqueta, cantidad, tope, colores, color }) {
  const ancho = tope > 0 ? Math.round((cantidad / tope) * 100) : 0;
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between" style={{ fontSize: '0.78rem' }}>
        <span>{etiqueta}</span>
        <span style={{ color: '#8b84a3' }}>{cantidad}</span>
      </div>
      <div className="recurso-progreso" style={{ height: 8, background: '#2a2740', borderRadius: 4 }}>
        <div
          style={{ height: '100%', borderRadius: 4, background: colores?.[etiqueta] || color || '#7c66e8', width: `${ancho}%` }}
        />
      </div>
    </div>
  );
}

function AdminPanelPage() {
  const usuario = JSON.parse(
    localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null'
  );
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const esAdmin = usuario?.rol === 'admin';

  useEffect(() => {
    if (!esAdmin) return;
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || 'No se pudieron cargar las estadísticas'));
  }, [esAdmin]);

  if (!esAdmin) {
    return (
      <div className="proyectos-pagina">
        <Container fluid className="pt-4 px-lg-5">
          <Alert variant="danger">No tienes permisos para ver el panel de administración.</Alert>
          <Button className="proyectos-boton" as={Link} to="/">
            Ir al panel
          </Button>
        </Container>
      </div>
    );
  }

  const kpis = stats
    ? [
        { etiqueta: 'Usuarios', valor: stats.total_usuarios, color: '#7c66e8' },
        { etiqueta: 'Proyectos', valor: stats.total_proyectos, color: '#38bdf8' },
        { etiqueta: 'Equipos', valor: stats.total_equipos, color: '#34d399' },
        { etiqueta: 'Postulaciones', valor: stats.total_postulaciones, color: '#fbbf24' },
        { etiqueta: 'Recursos', valor: stats.total_recursos_aprendizaje, color: '#f472b6' },
        { etiqueta: 'Habilidades', valor: stats.total_habilidades, color: '#a78bfa' },
        { etiqueta: 'Comentarios', valor: stats.total_comentarios, color: '#fb7185' },
        { etiqueta: 'Integrantes', valor: stats.total_miembros_equipos, color: '#4ade80' },
        { etiqueta: 'Solicitudes', valor: stats.total_solicitudes_equipo, color: '#facc15' },
      ]
    : [];

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <h2 className="proyectos-titulo mb-1">Panel de administración</h2>
        <p className="proyectos-subtitulo mb-4">Métricas generales de la plataforma.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        {!stats ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : (
          <>
            <Row className="g-3 mb-4">
              {kpis.map((k) => (
                <Col xxl={2} xl={3} lg={4} md={4} sm={6} key={k.etiqueta}>
                  <div className="proyectos-filtros-panel p-3 h-100">
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.valor}</div>
                    <div className="proyectos-subtitulo mt-1" style={{ fontSize: '0.82rem' }}>{k.etiqueta}</div>
                  </div>
                </Col>
              ))}
            </Row>

            <Row className="g-4 mb-4">
              <Col lg={6} xl={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Usuarios por rol</strong>
                  {stats.usuarios_por_rol.length ? (
                    stats.usuarios_por_rol.map((g) => (
                      <Barra
                        key={g._id}
                        etiqueta={ETIQUETAS_ROL[g._id] || g._id}
                        cantidad={g.cantidad}
                        tope={maxDe(stats.usuarios_por_rol)}
                        color="#7c66e8"
                      />
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
              <Col lg={6} xl={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Proyectos por estado</strong>
                  {stats.proyectos_por_estado.length ? (
                    stats.proyectos_por_estado.map((g) => (
                      <Barra
                        key={g._id}
                        etiqueta={ETIQUETAS_ESTADO[g._id] || g._id}
                        cantidad={g.cantidad}
                        tope={maxDe(stats.proyectos_por_estado)}
                      />
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
              <Col lg={6} xl={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Equipos por estado</strong>
                  {stats.equipos_por_estado.length ? (
                    stats.equipos_por_estado.map((g) => (
                      <Barra
                        key={g._id}
                        etiqueta={ETIQUETAS_ESTADO_EQUIPO[g._id] || g._id}
                        cantidad={g.cantidad}
                        tope={maxDe(stats.equipos_por_estado)}
                        color="#34d399"
                      />
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
              <Col lg={6} xl={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Postulaciones por estado</strong>
                  {stats.postulaciones_por_estado.length ? (
                    stats.postulaciones_por_estado.map((g) => (
                      <Barra
                        key={g._id}
                        etiqueta={g._id}
                        cantidad={g.cantidad}
                        tope={maxDe(stats.postulaciones_por_estado)}
                        color="#fbbf24"
                      />
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
              <Col lg={6} xl={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Recursos por tipo</strong>
                  {stats.recursos_por_tipo.length ? (
                    stats.recursos_por_tipo.map((g) => (
                      <Barra
                        key={g._id}
                        etiqueta={ETIQUETAS_TIPO[g._id] || g._id}
                        cantidad={g.cantidad}
                        tope={maxDe(stats.recursos_por_tipo)}
                        color="#f472b6"
                      />
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
              <Col lg={6} xl={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Habilidades más pedidas</strong>
                  {stats.habilidades_mas_pedidas.length ? (
                    stats.habilidades_mas_pedidas.map((h) => (
                      <Barra key={h._id} etiqueta={h.nombre} cantidad={h.cantidad} tope={maxDe(stats.habilidades_mas_pedidas)} color="#a78bfa" />
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
            </Row>

            <Row className="g-4">
              <Col lg={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Usuarios recientes</strong>
                  {stats.usuarios_recientes?.length ? (
                    stats.usuarios_recientes.map((u) => (
                      <div className="equipo-miembro" key={String(u._id)}>
                        <div>
                          <Link to={`/usuario/${u._id}`} className="perfil-publico-enlace">
                            {u.nombre} {u.apellido_paterno}
                          </Link>
                          <div className="proyecto-detalle-texto" style={{ fontSize: '0.75rem' }}>
                            {u.email} · {ETIQUETAS_ROL[u.rol] || u.rol}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
              <Col lg={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Proyectos recientes</strong>
                  {stats.proyectos_recientes?.length ? (
                    stats.proyectos_recientes.map((p) => (
                      <div className="equipo-miembro" key={String(p._id)}>
                        <div>
                          <Link to={`/proyecto/${p._id}`} className="perfil-publico-enlace">
                            {p.titulo}
                          </Link>
                          <div className="proyecto-detalle-texto" style={{ fontSize: '0.75rem' }}>
                            {ETIQUETAS_ESTADO[p.estado] || p.estado} ·{' '}
                            {new Date(p.fecha_creacion).toLocaleDateString('es')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
              <Col lg={4}>
                <div className="proyectos-filtros-panel p-3 h-100">
                  <strong className="d-block mb-3">Equipos recientes</strong>
                  {stats.equipos_recientes?.length ? (
                    stats.equipos_recientes.map((e) => (
                      <div className="equipo-miembro" key={String(e._id)}>
                        <div>
                          <Link to="/equipos" className="perfil-publico-enlace">
                            {e.nombre}
                          </Link>
                          <div className="proyecto-detalle-texto" style={{ fontSize: '0.75rem' }}>
                            {ETIQUETAS_ESTADO_EQUIPO[e.estado] || e.estado} ·{' '}
                            {new Date(e.fecha_creacion).toLocaleDateString('es')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="proyecto-detalle-texto">Sin datos.</span>
                  )}
                </div>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default AdminPanelPage;