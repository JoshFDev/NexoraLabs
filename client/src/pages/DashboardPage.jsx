import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import IconoHabilidad from '../components/IconoHabilidad';
import { leerUsuario, esPerfilCompleto } from '../utils/perfil';
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

function DashboardPage() {
  const [proyectos, setProyectos] = useState([]);
  const [recomendados, setRecomendados] = useState(null);
  const [misProyectos, setMisProyectos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const navigate = useNavigate();

  const usuario = leerUsuario();
  const perfilCompleto = esPerfilCompleto(usuario);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resProyectos, resRecomendados, resMis] = await Promise.all([
          api.get('/proyectos?limite=6&orden=recientes'),
          api.get('/proyecto/recomendados').catch(() => null),
          api
            .get(`/proyectos?creador=${usuario._id || usuario.id}&limite=6&orden=recientes`)
            .catch(() => null),
        ]);
        setProyectos(resProyectos.data.proyectos || []);
        setRecomendados(resRecomendados?.data || null);
        setMisProyectos(resMis?.data?.proyectos || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar datos');
      } finally {
        setCargando(false);
      }
    };
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const alternar = (id) => setExpandido((prev) => (prev === id ? null : id));

  const rendDetalle = useCallback(
    (p) => (
      <section className="proyecto-fila-detalle">
        <div className="proyecto-detalle-bloque">
          <span className="proyecto-detalle-etiqueta">Habilidades requeridas</span>
          <div className="proyecto-detalle-chips">
            {p.habilidades_requeridas?.length ? (
              p.habilidades_requeridas.map((h) => (
                <span key={String(h._id || h)} className="proyecto-detalle-chip">
                  <IconoHabilidad nombre={h.nombre || h} />
                  {h.nombre || h}
                </span>
              ))
            ) : (
              <span className="proyecto-detalle-texto">Sin habilidades específicas.</span>
            )}
          </div>
        </div>
        <div className="proyecto-detalle-bloque">
          <span className="proyecto-detalle-etiqueta">Equipo</span>
          <span className="proyecto-detalle-texto">
            {p.integrantes_maximos || 1} integrante(s) máximo
          </span>
        </div>
        {p.fecha_limite && (
          <div className="proyecto-detalle-bloque">
            <span className="proyecto-detalle-etiqueta">Fecha límite</span>
            <span className="proyecto-detalle-texto">
              {new Date(p.fecha_limite).toLocaleDateString('es')}
            </span>
          </div>
        )}
        <div className="proyecto-detalle-bloque">
          <span className="proyecto-detalle-etiqueta">Publicado</span>
          <span className="proyecto-detalle-texto">
            {new Date(p.fecha_creacion).toLocaleDateString('es')}
          </span>
        </div>
        <div className="proyecto-detalle-acciones">
          <Button
            variant="primary"
            size="sm"
            className="proyectos-boton"
            onClick={() => navigate(`/proyecto/${p._id}`)}
          >
            Ver proyecto
          </Button>
        </div>
      </section>
    ),
    [navigate]
  );

  const rendCarjeta = useCallback(
    (p) => (
      <article
        className={`proyecto-fila${expandido === p._id ? ' abierto' : ''}`}
        key={p._id}
        onClick={() => alternar(p._id)}
      >
        <div className="proyecto-fila-cabecera">
          <h3 className="proyecto-titulo-tarjeta mb-1">{p.titulo}</h3>
          <span className="proyecto-fila-flecha" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
        <div className="proyecto-meta mb-2">
          <span className="proyecto-badge">{ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
          <span className="proyecto-badge">{ETIQUETAS_NIVEL[p.nivel_dificultad] || p.nivel_dificultad}</span>
          {p.categoria && <span className="proyecto-badge">{p.categoria}</span>}
        </div>
        <p className="proyecto-descripcion">{p.descripcion}</p>
        <footer className="proyecto-creador">
          Creado por{' '}
          {p.creador_id?._id || p.creador_id ? (
            <Link to={`/usuario/${p.creador_id?._id || p.creador_id}`} className="perfil-publico-enlace">
              {p.creador_id?.nombre || 'anon'}
            </Link>
          ) : (
            'anon'
          )}{' '}
          · {p.integrantes_maximos || 1} integrante(s)
          {p.coincidencias ? ` · ${p.coincidencias} coincidencia${p.coincidencias !== 1 ? 's' : ''}` : ''}
        </footer>
        <div className={`proyecto-fila-contenido${expandido === p._id ? ' abierto' : ''}`}>
          {rendDetalle(p)}
        </div>
      </article>
    ),
    [expandido, rendDetalle]
  );

  const rendMini = useCallback(
    (p) => (
      <div
        className={`recomendado-mini${expandido === p._id ? ' abierto' : ''}`}
        key={p._id}
        onClick={() => alternar(p._id)}
      >
        <h6>{p.titulo}</h6>
        <span className="proyecto-badge">{ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
        <p>{p.descripcion.length > 90 ? `${p.descripcion.slice(0, 90)}…` : p.descripcion}</p>
        {p.coincidencias !== undefined && (
          <span className="proyecto-badge">
            {p.coincidencias} coincidencia{p.coincidencias !== 1 ? 's' : ''}
          </span>
        )}
        <div className={`proyecto-fila-contenido${expandido === p._id ? ' abierto' : ''}`}>
          {rendDetalle(p)}
        </div>
      </div>
    ),
    [expandido, rendDetalle]
  );

  if (cargando) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="secondary" />
      </Container>
    );
  }

  if (!perfilCompleto) {
    return (
      <Container className="dash-bloqueo-wrap">
        <div className="dash-bloqueo">
          <span className="dash-bloqueo-icono">!</span>
          <h2>Tu perfil está incompleto</h2>
          <p>
            Completa tu perfil para desbloquear el panel y poder crear proyectos, unirte a equipos y postularte.
          </p>
          <Button as={Link} to="/perfil" className="dash-bloqueo-btn">
            Completar mi perfil
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <Row className="align-items-end mb-4">
          <Col>
            <h2 className="proyectos-titulo mb-0">Hola, {usuario?.nombre || 'compañero'}</h2>
            <p className="proyectos-subtitulo mb-0">Aquí está lo nuevo de tus proyectos y recomendaciones.</p>
          </Col>
          <Col xs="auto">
            <Button className="proyectos-boton" as={Link} to="/explorar">
              Explorar proyectos
            </Button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="g-4">
          <Col xl={4} xxl={3}>
            <aside className="proyectos-recomendados">
              <strong className="d-block mb-3">Recomendados para ti</strong>
              {!recomendados || recomendados.proyectos?.length === 0 ? (
                <p className="proyectos-subtitulo" style={{ fontSize: '0.82rem', margin: 0 }}>
                  Registra tus habilidades para obtener recomendaciones.
                </p>
              ) : (
                recomendados.proyectos.slice(0, 6).map(rendMini)
              )}
            </aside>
          </Col>

          <Col xl={8} xxl={6}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="proyectos-titulo mb-0" style={{ fontSize: '1.1rem' }}>
                Proyectos recientes
              </h3>
              <span className="proyectos-subtitulo" style={{ fontSize: '0.82rem' }}>
                {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''}
              </span>
            </div>

            {proyectos.length === 0 ? (
              <p className="proyectos-vacio">Todavía no hay proyectos publicados.</p>
            ) : (
              proyectos.map(rendCarjeta)
            )}
          </Col>

          <Col xl={12} xxl={3}>
            <aside className="proyectos-recomendados">
              <strong className="d-block mb-3">Mis proyectos</strong>
              {misProyectos === null ? (
                <p className="proyectos-subtitulo" style={{ fontSize: '0.82rem', margin: 0 }}>
                  Cargando…
                </p>
              ) : misProyectos.length === 0 ? (
                <p className="proyectos-subtitulo" style={{ fontSize: '0.82rem', margin: 0 }}>
                  Aún no has creado proyectos.
                </p>
              ) : (
                misProyectos.map(rendMini)
              )}
            </aside>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DashboardPage;