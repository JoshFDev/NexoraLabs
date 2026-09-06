import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';
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

function ProyectoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/proyecto/${id}`)
      .then((res) => setProyecto(res.data))
      .catch((err) => setError(err.response?.data?.error || 'No se encontró el proyecto'))
      .finally(() => setCargando(false));
  }, [id]);

  return (
    <div className="proyectos-pagina">
      <Container className="pt-4" style={{ maxWidth: 820 }}>
        <Button
          variant="link"
          className="mb-3 p-0"
          style={{ color: '#c4b5fd', textDecoration: 'none', fontWeight: 600 }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </Button>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
          </div>
        ) : error ? (
          <>
            <Alert variant="danger">{error}</Alert>
            <Button variant="primary" className="proyectos-boton" as={Link} to="/explorar">
              Explorar proyectos
            </Button>
          </>
        ) : (
          <div className="proyecto-detalle">
            <div className="proyecto-tarjeta-cabecera mb-2">
              <h3>{proyecto.titulo}</h3>
            </div>
            <div className="proyecto-meta mb-3">
              <span className="proyecto-badge">{ETIQUETAS_ESTADO[proyecto.estado] || proyecto.estado}</span>
              <span className="proyecto-badge">{ETIQUETAS_NIVEL[proyecto.nivel_dificultad] || proyecto.nivel_dificultad}</span>
              {proyecto.categoria && <span className="proyecto-badge">{proyecto.categoria}</span>}
            </div>

            <p className="proyecto-detalle-desc mb-4">{proyecto.descripcion}</p>

            <div className="mb-3">
              <strong style={{ color: 'var(--nx-brillo)', fontSize: '0.9rem' }}>Habilidades requeridas</strong>
              <div className="proyecto-habilidades-chips">
                {proyecto.habilidades_requeridas?.length ? (
                  proyecto.habilidades_requeridas.map((h) => (
                    <span key={String(h._id || h)} className="proyecto-chip-habilidad seleccionada" style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconoHabilidad nombre={h.nombre || h} />
                      {h.nombre || h}
                    </span>
                  ))
                ) : (
                  <span className="proyecto-detalle-fila" style={{ margin: 0 }}>Sin habilidades específicas.</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(237,233,255,0.12)' }}>
              <div className="proyecto-detalle-fila">
                <strong>Creador</strong> {proyecto.creador_id?.nombre || 'Anónimo'} · {proyecto.creador_id?.email || ''}
              </div>
              <div className="proyecto-detalle-fila">
                <strong>Integrantes</strong> {proyecto.integrantes_maximos || 1}
              </div>
              {proyecto.fecha_limite && (
                <div className="proyecto-detalle-fila">
                  <strong>Fecha límite</strong> {new Date(proyecto.fecha_limite).toLocaleDateString('es')}
                </div>
              )}
              <div className="proyecto-detalle-fila">
                <strong>Publicado</strong> {new Date(proyecto.fecha_creacion).toLocaleDateString('es')}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default ProyectoDetallePage;