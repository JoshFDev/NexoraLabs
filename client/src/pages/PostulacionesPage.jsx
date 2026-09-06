import { useEffect, useMemo, useState } from 'react';
import { Container, Spinner, Alert, Button, Form } from 'react-bootstrap';
import api from '../api';
import IconoHabilidad from '../components/IconoHabilidad';
import './ProyectosPage.css';

const ETIQUETAS_ESTADO_POSTULACION = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

const UMBRALES = [
  { valor: '', etiqueta: 'Cualquier ajuste' },
  { valor: '50', etiqueta: 'Ajuste ≥ 50%' },
  { valor: '75', etiqueta: 'Ajuste ≥ 75%' },
];

function ajuste(postulacion) {
  const requeridas = (postulacion.proyecto_id?.habilidades_requeridas || []).map((h) =>
    String(h._id || h)
  );
  const ofrecidas = (postulacion.habilidades_ofrecidas || []).map((h) => String(h._id || h));
  if (!requeridas.length) return null;
  const cubiertas = requeridas.filter((h) => ofrecidas.includes(h)).length;
  return Math.round((cubiertas / requeridas.length) * 100);
}

function PostulacionesPage() {
  const [postulaciones, setPostulaciones] = useState(null);
  const [cargandoId, setCargandoId] = useState(null);
  const [error, setError] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [mejorAjuste, setMejorAjuste] = useState(false);
  const [umbral, setUmbral] = useState('');

  useEffect(() => {
    api
      .get('/mis-proyectos/postulaciones')
      .then((res) => {
        const conAjuste = (res.data || []).map((po) => ({ ...po, _ajuste: ajuste(po) }));
        setPostulaciones(conAjuste);
      })
      .catch((err) => setError(err.response?.data?.error || 'No se pudieron cargar las postulaciones'));
  }, []);

  const grupos = useMemo(() => {
    const agrupadas = {};
    (postulaciones || []).forEach((po) => {
      const id = String(po.proyecto_id?._id || po.proyecto_id);
      const titulo = po.proyecto_id?.titulo || 'Proyecto';
      if (!agrupadas[id]) agrupadas[id] = { id, titulo, lista: [] };
      agrupadas[id].lista.push(po);
    });
    Object.values(agrupadas).forEach((grupo) => {
      grupo.lista.sort(
        mejorAjuste
          ? (a, b) => (b._ajuste ?? -1) - (a._ajuste ?? -1)
          : (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
    });
    return agrupadas;
  }, [postulaciones, mejorAjuste]);

  const gruposVisibles = useMemo(() => {
    const lista = Object.values(grupos).filter(
      (g) => !filtroProyecto || g.id === filtroProyecto
    );
    if (!mejorAjuste || !umbral) return lista;
    return lista.map((g) => ({
      ...g,
      lista: g.lista.filter((po) => po._ajuste === null || po._ajuste >= Number(umbral)),
    }));
  }, [grupos, filtroProyecto, mejorAjuste, umbral]);

  const cambiarEstado = async (po, estado) => {
    setCargandoId(String(po._id));
    setError('');
    try {
      const res = await api.put(`/postulacion/${po._id}/estado`, { estado });
      setPostulaciones((prev) =>
        prev.map((x) => (String(x._id) === String(po._id) ? { ...x, estado: res.data.estado } : x))
      );
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo actualizar la postulación');
    } finally {
      setCargandoId(null);
    }
  };

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <h2 className="proyectos-titulo mb-1">Postulaciones recibidas</h2>
        <p className="proyectos-subtitulo mb-4">Revisa quién quiere sumarse a tus proyectos.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        {postulaciones === null ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : (
          <>
            <div className="proyectos-toolbar postulacion-toolbar mb-4">
              <Form.Select
                value={filtroProyecto}
                onChange={(e) => setFiltroProyecto(e.target.value)}
                style={{ maxWidth: '340px' }}
              >
                <option value="">Todos los proyectos</option>
                {Object.values(grupos).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.titulo} ({g.lista.length})
                  </option>
                ))}
              </Form.Select>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Form.Check
                  type="switch"
                  id="postulacion-mejor-ajuste"
                  label="Mejor ajuste primero"
                  checked={mejorAjuste}
                  onChange={(e) => setMejorAjuste(e.target.checked)}
                />
                {mejorAjuste && (
                  <Form.Select
                    value={umbral}
                    onChange={(e) => setUmbral(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    {UMBRALES.map((u) => (
                      <option key={u.valor} value={u.valor}>{u.etiqueta}</option>
                    ))}
                  </Form.Select>
                )}
              </div>
            </div>

            {gruposVisibles.length === 0 ? (
              <p className="proyectos-vacio">
                {postulaciones.length === 0
                  ? 'Todavía no recibes postulaciones. Al crear un proyecto se listarán aquí.'
                  : 'No hay postulaciones que coincidan con los filtros.'}
              </p>
            ) : (
              gruposVisibles.map((grupo) => {
                if (!grupo.lista.length) return null;
                return (
                  <div key={grupo.id} className="mb-4">
                    <h3 className="proyectos-titulo mb-2" style={{ fontSize: '1.05rem' }}>
                      {grupo.titulo}
                      <span className="proyectos-subtitulo" style={{ fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                        ({grupo.lista.length})
                      </span>
                    </h3>
                    {grupo.lista.map((po) => (
                      <article className="postulacion-tarjeta" key={String(po._id)}>
                        <div className="postulacion-cabeza">
                          <div>
                            <strong className="postulacion-nombre">
                              {po.usuario_id?.nombre || 'Anónimo'}{' '}
                              {po.usuario_id?.apellido_paterno || ''}
                            </strong>
                            <div className="postulacion-email">
                              {po.usuario_id?.email || ''}
                              {po.usuario_id?.rol ? ` · ${po.usuario_id.rol}` : ''}
                            </div>
                            {po.mensaje && <p className="postulacion-mensaje">{po.mensaje}</p>}
                            <div className="proyecto-detalle-chips" style={{ marginTop: '0.5rem' }}>
                              {(po.habilidades_ofrecidas || []).map((h) => (
                                <span key={String(h._id || h)} className="proyecto-detalle-chip">
                                  <IconoHabilidad nombre={h.nombre || h} />
                                  {h.nombre || h}
                                </span>
                              ))}
                              {!po.habilidades_ofrecidas?.length && (
                                <span className="proyecto-detalle-texto">Sin habilidades indicadas.</span>
                              )}
                            </div>
                          </div>
                          <div className="postulacion-acciones">
                            <div className="postulacion-badges">
                              {po._ajuste !== null && (
                                <span className={`postulacion-match${po._ajuste <= 0 ? ' bajo' : po._ajuste >= 75 ? ' activo' : ''}`}>
                                  Ajuste {po._ajuste}%
                                </span>
                              )}
                              <span className={`postulacion-estado ${po.estado}`}>
                                {ETIQUETAS_ESTADO_POSTULACION[po.estado] || po.estado}
                              </span>
                            </div>
                            {po.estado === 'pendiente' && (
                              <div className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  className="proyectos-boton"
                                  disabled={cargandoId === String(po._id)}
                                  onClick={() => cambiarEstado(po, 'aceptada')}
                                >
                                  Aceptar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-light"
                                  className="proyectos-boton"
                                  disabled={cargandoId === String(po._id)}
                                  onClick={() => cambiarEstado(po, 'rechazada')}
                                >
                                  Rechazar
                                </Button>
                              </div>
                            )}
                            <div className="postulacion-fecha">
                              {new Date(po.fecha).toLocaleDateString('es')} ·{' '}
                              {new Date(po.fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                );
              })
            )}
          </>
        )}
      </Container>
    </div>
  );
}

export default PostulacionesPage;