import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import api from '../api';
import IconoHabilidad from '../components/IconoHabilidad';
import './ProyectosPage.css';

const ETIQUETAS_ESTADO_POSTULACION = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
};

function PostulacionesPage() {
  const [postulaciones, setPostulaciones] = useState(null);
  const [cargandoId, setCargandoId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/mis-proyectos/postulaciones')
      .then((res) => setPostulaciones(res.data || []))
      .catch((err) => setError(err.response?.data?.error || 'No se pudieron cargar las postulaciones'));
  }, []);

  const agrupadas = {};
  (postulaciones || []).forEach((po) => {
    const id = String(po.proyecto_id?._id || po.proyecto_id);
    const titulo = po.proyecto_id?.titulo || 'Proyecto';
    if (!agrupadas[id]) agrupadas[id] = { id, titulo, lista: [] };
    agrupadas[id].lista.push(po);
  });

  const cambiarEstado = async (po, estado) => {
    setCargandoId(String(po._id));
    setError('');
    try {
      const res = await api.put(`/postulacion/${po._id}/estado`, { estado });
      setPostulaciones((prev) =>
        prev.map((x) => (String(x._id) === String(po._id) ? res.data : x))
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
        ) : Object.keys(agrupadas).length === 0 ? (
          <p className="proyectos-vacio">
            Todavía no recibes postulaciones. Al crear un proyecto se listarán aquí.
          </p>
        ) : (
          Object.values(agrupadas).map((grupo) => (
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
                      <Badge className="postulacion-estado">
                        {ETIQUETAS_ESTADO_POSTULACION[po.estado] || po.estado}
                      </Badge>
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
          ))
        )}
      </Container>
    </div>
  );
}

export default PostulacionesPage;