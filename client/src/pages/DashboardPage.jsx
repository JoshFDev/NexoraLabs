import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button, Modal } from 'react-bootstrap';
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
  const [misLogros, setMisLogros] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null);
  const navigate = useNavigate();

  const usuario = leerUsuario();
  const perfilCompleto = esPerfilCompleto(usuario);
  const puedeCrear = usuario && ['admin', 'mentor', 'desarrollador', 'ingeniero'].includes(usuario.rol);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resProyectos, resRecomendados, resMis, resLogros] = await Promise.all([
          api.get('/proyectos?limite=6&orden=recientes'),
          api.get('/proyecto/recomendados').catch(() => null),
          api
            .get(`/proyectos?creador=${usuario._id || usuario.id}&limite=6&orden=recientes`)
            .catch(() => null),
          api.get('/mis-logros').catch(() => null),
        ]);
        setProyectos(resProyectos.data.proyectos || []);
        setRecomendados(resRecomendados?.data || null);
        setMisProyectos(resMis?.data?.proyectos || []);
        setMisLogros(resLogros?.data || null);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar datos');
      } finally {
        setCargando(false);
      }
    };
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const inicial = (usuario?.nombre || 'U').charAt(0).toUpperCase();
  const totalRecomendados = recomendados?.proyectos?.length || 0;

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
          <div>
            <h3 className="proyecto-titulo-tarjeta mb-1">{p.titulo}</h3>
            <span className="proyecto-fila-creador-meta">
              {p.creador_id?.nombre || 'anon'}
            </span>
          </div>
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

  const eliminarProyecto = async (id) => {
    setProyectoAEliminar(null);
    try {
      await api.delete(`/proyecto/${id}`);
      setMisProyectos((prev) => (prev || []).filter((p) => String(p._id) !== String(id)));
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos eliminar el proyecto.');
    }
  };

  const rendMini = useCallback(
    (p, esMio = false) => (
      <div
        className={`recomendado-mini${expandido === p._id ? ' abierto' : ''}`}
        key={p._id}
        onClick={() => alternar(p._id)}
      >
        <div className="recomendado-mini-cabecera">
          <h6>{p.titulo}</h6>
          <span className="recomendado-mini-posicion" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
        <p>{p.descripcion.length > 90 ? `${p.descripcion.slice(0, 90)}…` : p.descripcion}</p>
        <div className="recomendado-badges">
          <span className="proyecto-badge">{ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
          {p.coincidencias > 0 && (
            <span className="proyecto-badge proyecto-badge-coincidencia">
              {p.coincidencias} habilidad{p.coincidencias !== 1 ? 'es' : ''} en común
            </span>
          )}
        </div>
        <div className={`proyecto-fila-contenido${expandido === p._id ? ' abierto' : ''}`}>
          {rendDetalle(p)}
        </div>
        {esMio && (
          <div className="recomendado-mini-acciones" onClick={(ev) => ev.stopPropagation()}>
            <Button
              variant="primary"
              size="sm"
              className="proyectos-boton"
              onClick={() => navigate(`/crear-proyecto?editar=${p._id}`)}
            >
              Editar
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="proyectos-boton"
              onClick={() => setProyectoAEliminar(p)}
            >
              Dar de baja
            </Button>
          </div>
        )}
      </div>
    ),
    [expandido, rendDetalle, navigate]
  );

  const estadisticas = [
    {
      etiqueta: 'Proyectos recientes',
      valor: proyectos.length,
      icono: 'folder_open',
      enlace: '/explorar',
    },
    {
      etiqueta: 'Recomendados para ti',
      valor: totalRecomendados,
      icono: 'favorite_border',
      enlace: '/explorar',
    },
    {
      etiqueta: 'Mis proyectos',
      valor: misProyectos?.length || 0,
      icono: 'check_circle_outline',
      enlace: '/crear-proyecto',
    },
    {
      etiqueta: 'Logros desbloqueados',
      valor: misLogros ? `${misLogros.total_obtenidos}/${misLogros.total_logros}` : '—',
      icono: 'workspace_premium',
      enlace: '/logros',
    },
  ];

  if (cargando) {
    return (
      <Container className="dash-cargando">
        <Spinner animation="border" />
        <p>Preparando tu panel…</p>
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
        {error && <Alert variant="danger">{error}</Alert>}

        <section className="dash-hero mb-4">
          <div className="dash-hero-avatar" aria-hidden="true">
            {usuario?.foto ? (
              <img src={usuario.foto} alt="" />
            ) : (
              inicial
            )}
          </div>
          <div className="dash-hero-datos">
            <span className="dash-hero-saludo">{saludo}</span>
            <h1 className="dash-hero-titulo mb-0">
              {usuario?.nombre || 'compañero'}
            </h1>
            <p className="dash-hero-subtitulo mb-0">
              Resumen de {puedeCrear ? 'tus proyectos' : 'la comunidad'} y recomendaciones para ti.
            </p>
          </div>
          <div className="dash-hero-acciones">
            <Button variant="outline-primary" className="dash-hero-btn" as={Link} to="/explorar">
              Explorar
            </Button>
            {puedeCrear && (
              <Button className="dash-hero-btn dash-hero-btn-primario" as={Link} to="/crear-proyecto">
                Crear proyecto
              </Button>
            )}
          </div>
        </section>

        <Row className="g-3 mb-4">
          {estadisticas.map((e) => (
            <Col key={e.etiqueta} xs={6} md={6} lg={3}>
              <Link to={e.enlace} className="dash-stat">
                <span className="dash-stat-icono" aria-hidden="true">
                  <span className="material-symbols-outlined">{e.icono}</span>
                </span>
                <span className="dash-stat-dato">
                  <strong>{e.valor}</strong>
                  <small>{e.etiqueta}</small>
                </span>
              </Link>
            </Col>
          ))}
        </Row>

        <Row className="g-4">
          <Col xl={8}>
            <section className="dash-seccion">
              <div className="dash-seccion-cabecera">
                <h3 className="proyectos-titulo mb-0" style={{ fontSize: '1.1rem' }}>
                  Proyectos recientes
                </h3>
                <Link to="/explorar" className="dash-ver-todo">
                  Ver todos
                </Link>
              </div>

              {proyectos.length === 0 ? (
                <div className="dash-vacio">
                  <span className="dash-vacio-icono"><span className="material-symbols-outlined">rocket_launch</span></span>
                  <p>Todavía no hay proyectos publicados.</p>
                  <Button size="sm" className="proyectos-boton" as={Link} to="/ofertas">
                    Ver oportunidades
                  </Button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {proyectos.map(rendCarjeta)}
                </div>
              )}
            </section>
          </Col>

          <Col xl={4}>
            <section className="dash-seccion">
              <div className="dash-seccion-cabecera">
                <h3 className="proyectos-titulo mb-0" style={{ fontSize: '1.1rem' }}>
                  Recomendados para ti
                </h3>
              </div>
              {!recomendados || recomendados.proyectos?.length === 0 ? (
                <div className="dash-vacio dash-vacio-chico">
                  <span className="dash-vacio-icono"><span className="material-symbols-outlined">lightbulb</span></span>
                  <p>
                    Registra tus habilidades para recibir recomendaciones.
                  </p>
                  <Button size="sm" variant="outline-light" className="proyectos-boton" as={Link} to="/habilidades">
                    Registrar habilidades
                  </Button>
                </div>
              ) : (
                recomendados.proyectos.slice(0, 6).map(rendMini)
              )}
            </section>
          </Col>
        </Row>

        <section className="dash-seccion mt-4 mb-5">
          <div className="dash-seccion-cabecera">
            <h3 className="proyectos-titulo mb-0" style={{ fontSize: '1.1rem' }}>
              Mis proyectos
            </h3>
            {puedeCrear && (
              <Link to="/crear-proyecto" className="dash-ver-todo">
                + Nuevo
              </Link>
            )}
          </div>
          {misProyectos === null ? (
            <p className="proyectos-subtitulo">Cargando…</p>
          ) : misProyectos.length === 0 ? (
            <div className="dash-vacio">
              <span className="dash-vacio-icono"><span className="material-symbols-outlined">folder_open</span></span>
              <p>
                {puedeCrear
                  ? 'Aún no has creado proyectos. Publica tu primera idea.'
                  : 'Aún no has creado proyectos.'}
              </p>
              {puedeCrear && (
                <Button size="sm" className="proyectos-boton" as={Link} to="/crear-proyecto">
                  Crear mi primer proyecto
                </Button>
              )}
            </div>
          ) : (
            <Row className="g-4">
              {misProyectos.map((p) => (
                <Col key={String(p._id)} xs={12} md={6} xl={4}>
                  {rendMini(p, true)}
                </Col>
              ))}
            </Row>
          )}
        </section>
      </Container>

      <Modal
        show={!!proyectoAEliminar}
        onHide={() => setProyectoAEliminar(null)}
        centered
      >
        <Modal.Header closeButton className="proyecto-modal-cabecera">
          <Modal.Title className="proyectos-titulo" style={{ fontSize: '1.05rem' }}>
            Solicitar la baja de un proyecto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            Vas a enviar la solicitud para dar de baja el proyecto{' '}
            <strong>"{proyectoAEliminar?.titulo}"</strong>.
          </p>
          <p className="proyectos-subtitulo mb-0" style={{ fontSize: '0.85rem' }}>
            El proyecto dejará de estar visible para la comunidad y los integrantes serán
            notificados de la salida. Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer className="proyecto-modal-pie">
          <Button
            variant="outline-light"
            className="proyectos-boton"
            onClick={() => setProyectoAEliminar(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="proyectos-boton"
            onClick={() =>
              proyectoAEliminar && eliminarProyecto(proyectoAEliminar._id)
            }
          >
            Enviar solicitud de baja
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DashboardPage;