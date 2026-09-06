import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import IconoHabilidad from '../components/IconoHabilidad';
import './ProyectosPage.css';

const ETIQUETAS_ESTADO = {
  borrador: 'Borrador',
  buscando_equipo: 'Buscando equipo',
  en_desarrollo: 'En desarrollo',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

const ETIQUETAS_NIVEL = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto',
};

const ETIQUETAS_ESTADO_EQUIPO = {
  activo: 'Activo',
  finalizado: 'Finalizado',
  disuelto: 'Disuelto',
};

function diasRestantes(fecha) {
  const fin = new Date(fecha);
  const hoy = new Date();
  const dias = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
  return dias;
}

function ProyectoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = JSON.parse(
    localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null'
  );
  const idUsuario = usuario?._id || usuario?.id;

  const [proyecto, setProyecto] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [soyMiembro, setSoyMiembro] = useState(false);
  const [nPostulaciones, setNPostulaciones] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoEquipo, setCargandoEquipo] = useState(true);
  const [accion, setAccion] = useState(null);
  const [error, setError] = useState('');

  const esCreador = proyecto && idUsuario && String(proyecto.creador_id?._id || proyecto.creador_id) === String(idUsuario);

  const cargarDatos = useCallback(() => {
    setCargandoEquipo(true);
    Promise.all([
      api.get('/equipos?limite=1&orden=recientes&' + new URLSearchParams({ proyecto: id })),
      api.get('/mis-equipos').catch(() => ({ data: [] })),
    ])
      .then(([resEquipos, resMis]) => {
        const primerEquipo = (resEquipos.data.equipos || [])[0] || null;
        setEquipo(primerEquipo);
        const pertenezco = (resMis.data || []).some(
          (e) => String(e._id) === String(primerEquipo?._id)
        );
        setSoyMiembro(pertenezco);
        if (primerEquipo) {
          return api.get(`/equipo/${primerEquipo._id}/miembros`).then((r) => {
            setMiembros(r.data || []);
            setSoyMiembro(
              (r.data || []).some((m) => String(m.usuario_id?._id) === String(idUsuario))
            );
          });
        }
        setMiembros([]);
        return null;
      })
      .catch((err) => setError(err.response?.data?.error || 'No se pudo cargar el equipo'))
      .finally(() => setCargandoEquipo(false));
  }, [id, idUsuario]);

  useEffect(() => {
    api
      .get(`/proyecto/${id}`)
      .then((res) => setProyecto(res.data))
      .catch((err) => setError(err.response?.data?.error || 'No se encontró el proyecto'))
      .finally(() => setCargando(false));
    cargarDatos();
  }, [id, cargarDatos]);

  useEffect(() => {
    if (!esCreador) return;
    api
      .get('/mis-proyectos/postulaciones')
      .then((res) => {
        const n = (res.data || []).filter(
          (po) => String(po.proyecto_id?._id || po.proyecto_id) === String(id)
        ).length;
        setNPostulaciones(n);
      })
      .catch(() => setNPostulaciones(0));
  }, [esCreador, id]);

  const unirse = async () => {
    if (!equipo) return;
    setAccion('unirse');
    setError('');
    try {
      await api.post(`/equipo/${equipo._id}/unirse`, {});
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo unir al equipo');
    } finally {
      setAccion(null);
    }
  };

  const salir = async () => {
    if (!equipo) return;
    setAccion('salir');
    setError('');
    try {
      await api.delete(`/equipo/${equipo._id}/salir`);
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo salir del equipo');
    } finally {
      setAccion(null);
    }
  };

  const dias = proyecto?.fecha_limite ? diasRestantes(proyecto.fecha_limite) : null;

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5" style={{ maxWidth: 1100 }}>
        <Button
          variant="link"
          className="mb-3 p-0 nav-link-nexora"
          style={{ fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </Button>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : error && !proyecto ? (
          <>
            <Alert variant="danger">{error}</Alert>
            <Button variant="primary" className="proyectos-boton" as={Link} to="/explorar">
              Explorar proyectos
            </Button>
          </>
        ) : (
          <div className="proyecto-detalle">
            <h3 className="proyecto-titulo mb-2" style={{ fontSize: '1.5rem' }}>{proyecto.titulo}</h3>
            <div className="proyecto-meta mb-4">
              <span className="proyecto-badge">{ETIQUETAS_ESTADO[proyecto.estado] || proyecto.estado}</span>
              <span className="proyecto-badge">{ETIQUETAS_NIVEL[proyecto.nivel_dificultad] || proyecto.nivel_dificultad}</span>
              {proyecto.categoria && <span className="proyecto-badge">{proyecto.categoria}</span>}
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {esCreador && nPostulaciones !== null && (
              <div className="proyectos-toolbar mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>{nPostulaciones}</strong>{' '}
                  <span className="proyectos-subtitulo">postulación(es) recibida(s) en este proyecto</span>
                </div>
                <Button className="proyectos-boton" as={Link} to="/postulaciones">
                  Ver postulaciones
                </Button>
              </div>
            )}

            <Row className="g-4">
              <Col lg={7}>
                <p className="proyecto-detalle-desc">{proyecto.descripcion}</p>

                <div className="mt-4">
                  <strong style={{ fontSize: '0.9rem' }}>Habilidades requeridas</strong>
                  <div className="proyecto-habilidades-chips mt-2">
                    {proyecto.habilidades_requeridas?.length ? (
                      proyecto.habilidades_requeridas.map((h) => (
                        <span
                          key={String(h._id || h)}
                          className="proyecto-chip-habilidad seleccionada"
                          style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <IconoHabilidad nombre={h.nombre || h} />
                          {h.nombre || h}
                        </span>
                      ))
                    ) : (
                      <span className="proyecto-detalle-texto">Sin habilidades específicas.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #efeff5' }}>
                  <div className="proyecto-detalle-fila">
                    <strong>Creador</strong> {proyecto.creador_id?.nombre || 'Anónimo'} · {proyecto.creador_id?.email || ''}
                  </div>
                  <div className="proyecto-detalle-fila">
                    <strong>Integrantes</strong> {miembros.length}/{proyecto.integrantes_maximos || 1}
                  </div>
                  {dias !== null && (
                    <div className="proyecto-detalle-fila">
                      <strong>Fecha límite</strong>{' '}
                      {new Date(proyecto.fecha_limite).toLocaleDateString('es')}
                      <span
                        className={`proyecto-badge${dias < 0 ? ' recurso-borrar' : ''}`}
                        style={dias >= 0 ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.45)', color: '#047857' } : {}}
                      >
                        {dias < 0
                          ? `Vencido hace ${Math.abs(dias)} día(s)`
                          : dias === 0
                          ? 'Vence hoy'
                          : `${dias} día(s) restante(s)`}
                      </span>
                    </div>
                  )}
                  <div className="proyecto-detalle-fila">
                    <strong>Publicado</strong> {new Date(proyecto.fecha_creacion).toLocaleDateString('es')}
                  </div>
                </div>
              </Col>

              <Col lg={5}>
                <div className="proyectos-filtros-panel mb-4" style={{ position: 'static' }}>
                  <h4 className="proyectos-titulo mb-1" style={{ fontSize: '1.05rem' }}>Equipo del proyecto</h4>
                  <p className="proyectos-subtitulo" style={{ fontSize: '0.82rem' }}>
                    {proyecto.estado === 'en_desarrollo' || proyecto.estado === 'finalizado'
                      ? 'El equipo que construye este proyecto.'
                      : 'Únete y forma parte del equipo.'}
                  </p>

                  {cargandoEquipo ? (
                    <div className="text-center py-4">
                      <Spinner animation="border" size="sm" variant="secondary" />
                    </div>
                  ) : equipo ? (
                    <>
                      <div className="proyecto-meta mb-3">
                        <span className="proyecto-badge">{equipo.nombre}</span>
                        <span className="proyecto-badge">{ETIQUETAS_ESTADO_EQUIPO[equipo.estado] || equipo.estado}</span>
                        <span className="proyecto-badge">{miembros.length} integrante(s)</span>
                      </div>
                      {equipo.descripcion && (
                        <p className="proyecto-detalle-texto mb-3">{equipo.descripcion}</p>
                      )}
                      <div className="equipo-miembros mb-3">
                        {miembros.length ? (
                          miembros.map((m) => (
                            <div className="equipo-miembro" key={String(m._id)}>
                              <div>
                                <strong>
                                  {m.usuario_id?.nombre || 'Anónimo'} {m.usuario_id?.apellido_paterno || ''}
                                </strong>
                                <div className="proyecto-detalle-texto">{m.usuario_id?.email || ''}</div>
                              </div>
                              <span className="proyecto-badge">{m.rol || 'miembro'}</span>
                            </div>
                          ))
                        ) : (
                          <span className="proyecto-detalle-texto">Sin integrantes todavía.</span>
                        )}
                      </div>
                      {equipo.estado === 'activo' &&
                        (soyMiembro ? (
                          <Button size="sm" variant="outline-light" className="proyectos-boton" disabled={!!accion} onClick={salir}>
                            {accion === 'salir' ? 'Saliendo…' : 'Salir del equipo'}
                          </Button>
                        ) : (
                          <Button size="sm" className="proyectos-boton" disabled={!!accion} onClick={unirse}>
                            {accion === 'unirse' ? 'Uniéndote…' : 'Unirse al equipo'}
                          </Button>
                        ))}
                    </>
                  ) : (
                    <>
                      <p className="proyecto-detalle-texto mb-3">Este proyecto aún no tiene equipo.</p>
                      <Button size="sm" className="proyectos-boton" as={Link} to="/equipos">
                        Explorar equipos
                      </Button>
                    </>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
}

export default ProyectoDetallePage;