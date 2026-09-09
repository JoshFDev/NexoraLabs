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
  const [misLogros, setMisLogros] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState(null);
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
    if (!window.confirm('¿Seguro que quieres eliminar este proyecto? No se puede deshacer.')) return;
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
              onClick={() => eliminarProyecto(p._id)}
            >
              Eliminar
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
      icono: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      enlace: '/explorar',
      color: 'dalton',
    },
    {
      etiqueta: 'Recomendados para ti',
      valor: totalRecomendados,
      icono: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      enlace: '/explorar',
      color: 'rosa',
    },
    {
      etiqueta: 'Mis proyectos',
      valor: misProyectos?.length || 0,
      icono: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" /><path d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" />
        </svg>
      ),
      enlace: '/crear-proyecto',
      color: 'verde',
    },
    {
      etiqueta: 'Logros desbloqueados',
      valor: misLogros ? `${misLogros.total_obtenidos}/${misLogros.total_logros}` : '—',
      icono: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
      enlace: '/logros',
      color: 'oro',
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
              Aquí está lo nuevo de {puedeCrear ? 'tus proyectos' : 'la comunidad'} y tus recomendaciones.
            </p>
          </div>
          <div className="dash-hero-acciones">
            <Button variant="outline-light" className="dash-hero-btn" as={Link} to="/explorar">
              Explorar
            </Button>
            {puedeCrear && (
              <Button className="dash-hero-btn dash-hero-btn-primario" as={Link} to="/crear-proyecto">
                + Crear proyecto
              </Button>
            )}
          </div>
        </section>

        <Row className="g-3 mb-4">
          {estadisticas.map((e) => (
            <Col key={e.etiqueta} xs={6} lg={3}>
              <Link to={e.enlace} className={`dash-stat dash-stat-${e.color}`}>
                <span className="dash-stat-icono">{e.icono}</span>
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
                  <span className="dash-vacio-icono">🚀</span>
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
                  <span className="dash-vacio-icono">💡</span>
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
              <span className="dash-vacio-icono">🗂️</span>
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
    </div>
  );
}

export default DashboardPage;