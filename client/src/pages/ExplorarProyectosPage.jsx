import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Form, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
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

const ETIQUETAS_POSTULACION = {
  pendiente: 'Postulado',
  aceptada: 'Postulación aceptada',
  rechazada: 'Postulación rechazada',
  cancelada: 'Postulación cancelada',
};

const CATEGORIAS = ['web', 'movil', 'ia', 'backend', 'frontend', 'devops', 'big_data', 'diseno', 'otro'];

function ExplorarProyectosPage() {
  const [proyectos, setProyectos] = useState([]);
  const [recomendados, setRecomendados] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [textoBuscar, setTextoBuscar] = useState('');
  const [buscar, setBuscar] = useState('');
  const [filtros, setFiltros] = useState({ categoria: '', estado: '', nivel: '', orden: 'recientes' });
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [expandido, setExpandido] = useState(null);
  const [misProyectos, setMisProyectos] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [sugAbierta, setSugAbierta] = useState(false);
  const [misPostulaciones, setMisPostulaciones] = useState({});
  const [formPostulacion, setFormPostulacion] = useState(null);
  const [cargandoPost, setCargandoPost] = useState(false);

  const alternar = (id) => setExpandido((x) => (x === id ? null : id));

  const usuario =
    JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null');

  useEffect(() => {
    api
      .get('/proyecto/recomendados')
      .then((res) => setRecomendados(res.data))
      .catch(() => setRecomendados(null));
  }, []);

  useEffect(() => {
    if (!usuario?._id) return;
    api
      .get(`/proyectos?creador=${usuario._id}&limite=20&orden=recientes`)
      .then((res) => setMisProyectos(res.data.proyectos || []))
      .catch(() => setMisProyectos([]));
  }, [usuario?._id]);

  useEffect(() => {
    api
      .get('/mis-postulaciones')
      .then((res) => {
        const mapa = {};
        (res.data || []).forEach((po) => {
          if (po.proyecto_id?._id) mapa[String(po.proyecto_id._id)] = po;
        });
        setMisPostulaciones(mapa);
      })
      .catch(() => setMisPostulaciones({}));
  }, []);

  const refrescarMisPostulaciones = () =>
    api
      .get('/mis-postulaciones')
      .then((res) => {
        const mapa = {};
        (res.data || []).forEach((po) => {
          if (po.proyecto_id?._id) mapa[String(po.proyecto_id._id)] = po;
        });
        setMisPostulaciones(mapa);
      })
      .catch(() => setMisPostulaciones({}));

  const postular = async (p) => {
    setCargandoPost(true);
    try {
      await api.post(`/proyecto/${p._id}/postular`, {
        mensaje: formPostulacion?.id === p._id ? formPostulacion.mensaje : '',
        habilidades_ofrecidas: [],
      });
      setFormPostulacion(null);
      await refrescarMisPostulaciones();
    } catch (err) {
      if (err.response?.status === 409) await refrescarMisPostulaciones();
      setError(err.response?.data?.error || 'No se pudo postular');
    } finally {
      setCargandoPost(false);
    }
  };

  const retirarPostulacion = async (p) => {
    const po = misPostulaciones[String(p._id)];
    if (!po) return;
    setCargandoPost(true);
    try {
      await api.delete(`/postulacion-own/${po._id}`);
      setMisPostulaciones((prev) => {
        const nuevo = { ...prev };
        delete nuevo[String(p._id)];
        return nuevo;
      });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo retirar la postulación');
    } finally {
      setCargandoPost(false);
    }
  };

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams({ pagina, limite: '6', orden: filtros.orden });
    if (buscar) params.set('buscar', buscar);
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.estado) params.set('estado', filtros.estado);
    if (filtros.nivel) params.set('nivel', filtros.nivel);

    api
      .get(`/proyectos?${params}`)
      .then((res) => {
        setProyectos(res.data.proyectos || []);
        setTotalPaginas(res.data.total_paginas || 1);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar proyectos'))
      .finally(() => setCargando(false));
  }, [buscar, filtros, pagina]);

  const alBuscar = (e) => {
    e.preventDefault();
    setSugAbierta(false);
    setPagina(1);
    setBuscar(textoBuscar.trim());
  };

  useEffect(() => {
    const texto = textoBuscar.trim().toLowerCase();
    if (texto.length < 2) {
      setSugerencias([]);
      setSugAbierta(false);
      return;
    }
    const timer = setTimeout(() => {
      api
        .get(`/proyectos?buscar=${encodeURIComponent(texto)}&limite=20&orden=recientes`)
        .then((res) => {
          const coinciden = (res.data.proyectos || []).filter((p) =>
            (p.titulo || '').toLowerCase().includes(texto)
          );
          coinciden.sort((a, b) => {
            const aEmpieza = a.titulo.toLowerCase().startsWith(texto) ? 0 : 1;
            const bEmpieza = b.titulo.toLowerCase().startsWith(texto) ? 0 : 1;
            return aEmpieza - bEmpieza;
          });
          setSugerencias(coinciden.slice(0, 6));
        })
        .catch(() => setSugerencias([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [textoBuscar]);

  const elegirSug = (p) => {
    setTextoBuscar(p.titulo);
    setBuscar(p.titulo);
    setSugAbierta(false);
    setPagina(1);
  };

  const cambiarBusqueda = (v) => {
    setTextoBuscar(v);
    if (v.trim().length >= 2) setSugAbierta(true);
    else setSugAbierta(false);
  };

  const cambiarFiltro = (campo, valor) => {
    setPagina(1);
    setFiltros((f) => ({ ...f, [campo]: valor }));
  };

  const rendDetalle = useCallback(
    (p) => (
      <section className="proyecto-fila-detalle">
        <div className="proyecto-detalle-bloque">
          <span className="proyecto-detalle-etiqueta">Habilidades requeridas</span>
          <div className="proyecto-detalle-chips">
            {p.habilidades_requeridas?.length ? (
              p.habilidades_requeridas.map((h) => (
                <span key={h._id} className="proyecto-detalle-chip">
                  <IconoHabilidad nombre={h.nombre} />
                  {h.nombre}
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
        <div className="proyecto-detalle-bloque">
          <span className="proyecto-detalle-etiqueta">Creador</span>
          <span className="proyecto-detalle-texto">
            {p.creador_id?._id || p.creador_id ? (
              <Link to={`/usuario/${p.creador_id?._id || p.creador_id}`} className="perfil-publico-enlace">
                {p.creador_id?.nombre || 'Anónimo'}
              </Link>
            ) : (
              'Anónimo'
            )}
            {p.creador_id?.email ? ` · ${p.creador_id.email}` : ''}
          </span>
        </div>
        <div className="proyecto-detalle-bloque">
          <span className="proyecto-detalle-etiqueta">Publicado</span>
          <span className="proyecto-detalle-texto">{new Date(p.fecha_creacion).toLocaleDateString('es')}</span>
        </div>
        {p.fecha_limite && (
          <div className="proyecto-detalle-bloque">
            <span className="proyecto-detalle-etiqueta">Fecha límite</span>
            <span className="proyecto-detalle-texto">{new Date(p.fecha_limite).toLocaleDateString('es')}</span>
          </div>
        )}
        <div className="proyecto-detalle-acciones">
          {p.creador_id &&
          usuario &&
          String(p.creador_id._id || p.creador_id) === String(usuario._id || usuario.id) ? (
            <span className="proyecto-postulado-badge">Eres el creador de este proyecto</span>
          ) : misPostulaciones[String(p._id)] ? (
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="proyecto-postulado-badge">
                {ETIQUETAS_POSTULACION[misPostulaciones[String(p._id)].estado] ||
                  misPostulaciones[String(p._id)].estado}
              </span>
              {misPostulaciones[String(p._id)].estado === 'pendiente' && (
                <Button
                  variant="outline-light"
                  className="proyectos-boton"
                  size="sm"
                  disabled={cargandoPost}
                  onClick={() => retirarPostulacion(p)}
                >
                  Retirar postulación
                </Button>
              )}
            </div>
          ) : (
            <div className="proyecto-postulacion-form">
              {formPostulacion?.id === p._id && (
                <Form.Control
                  as="textarea"
                  rows={2}
                  className="proyecto-post-mensaje"
                  placeholder="Déjale un mensaje al creador (opcional)"
                  value={formPostulacion.mensaje}
                  onChange={(e) => setFormPostulacion({ id: p._id, mensaje: e.target.value })}
                />
              )}
              <Button
                variant="primary"
                className="proyectos-boton"
                size="sm"
                disabled={cargandoPost}
                onClick={() =>
                  formPostulacion?.id === p._id
                    ? postular(p)
                    : setFormPostulacion({ id: p._id, mensaje: '' })
                }
              >
                {formPostulacion?.id === p._id ? 'Confirmar postulación' : 'Postularme'}
              </Button>
            </div>
          )}
        </div>
      </section>
    ),
    [misPostulaciones, formPostulacion, cargandoPost]
  );

  const rendTarjeta = useCallback(
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

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <h2 className="proyectos-titulo mb-1">Explorar proyectos</h2>
        <p className="proyectos-subtitulo mb-4">Encuentra el siguiente reto y súmate a un equipo.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={alBuscar} className="proyectos-toolbar mb-4">
          <div className="proyectos-buscar-wrap">
            <Form.Control
              className="proyectos-buscar"
              placeholder="Buscar por título o descripción…"
              value={textoBuscar}
              onChange={(e) => cambiarBusqueda(e.target.value)}
              onFocus={() => { if (textoBuscar.trim().length >= 2) setSugAbierta(true); }}
              onBlur={() => setTimeout(() => setSugAbierta(false), 150)}
              onKeyDown={(e) => { if (e.key === 'Escape') setSugAbierta(false); }}
            />
            {sugAbierta && sugerencias.length > 0 && (
              <div className="proyectos-sug">
                {sugerencias.map((p) => (
                  <button
                    type="button"
                    key={p._id}
                    className="proyectos-sug-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => elegirSug(p)}
                  >
                    <span className="proyectos-sug-titulo">{p.titulo}</span>
                    <span className="proyecto-badge">{ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Form.Select value={filtros.categoria} onChange={(e) => cambiarFiltro('categoria', e.target.value)} style={{ width: 'auto' }}>
            <option value="">Categoría</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
          <Form.Select value={filtros.estado} onChange={(e) => cambiarFiltro('estado', e.target.value)} style={{ width: 'auto' }}>
            <option value="">Estado</option>
            {Object.entries(ETIQUETAS_ESTADO).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Form.Select>
          <Form.Select value={filtros.nivel} onChange={(e) => cambiarFiltro('nivel', e.target.value)} style={{ width: 'auto' }}>
            <option value="">Nivel</option>
            {Object.entries(ETIQUETAS_NIVEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Form.Select>
          <Form.Select value={filtros.orden} onChange={(e) => cambiarFiltro('orden', e.target.value)} style={{ width: 'auto' }}>
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="a-z">Título A-Z</option>
            <option value="z-a">Título Z-A</option>
          </Form.Select>
          <Button type="submit" variant="primary" className="proyectos-boton">
            Buscar
          </Button>
        </Form>

        <Row className="g-4">
          <Col xl={4} xxl={3}>
            <aside className="proyectos-recomendados">
              <strong className="d-block mb-3">Recomendados para ti</strong>
              {!recomendados || recomendados.proyectos?.length === 0 ? (
                <p className="proyectos-subtitulo" style={{ fontSize: '0.82rem', margin: 0 }}>
                  Registra tus habilidades para obtener recomendaciones.
                </p>
              ) : (
                recomendados.proyectos.slice(0, 6).map((p) => (
                  <div
                    className={`recomendado-mini${expandido === p._id ? ' abierto' : ''}`}
                    key={p._id}
                    onClick={() => alternar(p._id)}
                  >
                    <h6>{p.titulo}</h6>
                    <p>{p.descripcion.length > 90 ? `${p.descripcion.slice(0, 90)}…` : p.descripcion}</p>
                    <span className="proyecto-badge">
                      {p.coincidencias} coincidencia{p.coincidencias !== 1 ? 's' : ''}
                    </span>
                    <div className={`proyecto-fila-contenido${expandido === p._id ? ' abierto' : ''}`}>
                      {rendDetalle(p)}
                    </div>
                  </div>
                ))
              )}
            </aside>
          </Col>

          <Col xl={8} xxl={6}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="proyectos-titulo mb-0" style={{ fontSize: '1.1rem' }}>
                Todos los proyectos
              </h3>
              {!cargando && (
                <span className="proyectos-subtitulo" style={{ fontSize: '0.82rem' }}>
                  {proyectos.length} resultado{proyectos.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {cargando ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="secondary" />
              </div>
            ) : proyectos.length === 0 ? (
              <p className="proyectos-vacio">No hay proyectos que coincidan. Ajusta los filtros.</p>
            ) : (
              <>
                {proyectos.map(rendTarjeta)}
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
                misProyectos.slice(0, 6).map((p) => (
                  <div
                    className={`recomendado-mini${expandido === p._id ? ' abierto' : ''}`}
                    key={p._id}
                    onClick={() => alternar(p._id)}
                  >
                    <h6>{p.titulo}</h6>
                    <span className="proyecto-badge">{ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
                    <p>{p.descripcion.length > 90 ? `${p.descripcion.slice(0, 90)}…` : p.descripcion}</p>
                    <div className={`proyecto-fila-contenido${expandido === p._id ? ' abierto' : ''}`}>
                      {rendDetalle(p)}
                    </div>
                  </div>
                ))
              )}
            </aside>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ExplorarProyectosPage;