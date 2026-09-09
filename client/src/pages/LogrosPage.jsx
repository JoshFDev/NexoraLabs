import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import api from '../api';
import './ProyectosPage.css';

const estilos = {
  tarjeta: {
    position: 'relative',
    borderRadius: '0.9rem',
    border: '1px solid rgba(255,255,255,0.09)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))',
    padding: '1.25rem 1.1rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.15s ease',
  },
  icono: {
    fontSize: '2.1rem',
    lineHeight: 1,
  },
  obtenido: {
    borderColor: 'rgba(52,211,153,0.4)',
    boxShadow: '0 0 0 1px rgba(52,211,153,0.18)',
  },
  bloqueado: {
    opacity: 0.55,
    filter: 'grayscale(0.85)',
  },
  bloqueo: {
    fontSize: '0.62rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#f59e0b',
    border: '1px solid rgba(245,158,11,0.4)',
    padding: '0.15rem 0.55rem',
    borderRadius: '999px',
  },
  fecha: {
    fontSize: '0.72rem',
    color: '#34d399',
    fontWeight: 600,
  },
};

const ICONOS_TIPO = {
  crear_proyecto: '🚀 Creador',
  completar_perfil: '🎯 Perfil',
  postularse: '✋ Participación',
  unirse_equipo: '🤝 Equipo',
  comentar: '💬 Comunidad',
  calificar_recurso: '📚 Aprendizaje',
};

function LogrosPage() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/mis-logros')
      .then((res) => setDatos(res.data))
      .catch((err) => setError(err.response?.data?.error || 'No pudimos cargar tus logros.'));
  }, []);

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            <h2 className="proyectos-titulo mb-0">Mis logros</h2>
            <p className="proyectos-subtitulo mb-0">
              {datos
                ? `Has desbloqueado ${datos.total_obtenidos} de ${datos.total_logros} logros. Sigue participando para ganar los demás.`
                : 'Las insignias que consigues al crear, participar y aprender.'}
            </p>
          </div>
          {datos && (
            <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
              {datos.total_obtenidos}/{datos.total_logros}
            </span>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!datos && !error && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
          </div>
        )}

        {datos && (
          <Row className="g-4">
            {datos.logros.map((l) => (
              <Col key={l._id} xs={12} sm={6} lg={4} xl={3}>
                <div
                  style={{
                    ...estilos.tarjeta,
                    ...(l.obtenido ? estilos.obtenido : estilos.bloqueado),
                  }}
                >
                  <span style={estilos.icono}>{l.icono}</span>
                  <h4 className="proyectos-titulo mt-3 mb-1" style={{ fontSize: '1rem' }}>
                    {l.nombre}
                  </h4>
                  <p className="proyectos-subtitulo" style={{ fontSize: '0.82rem', flexGrow: 1 }}>
                    {l.descripcion}
                  </p>
                  <div
                    className="mb-2"
                    style={{
                      fontSize: '0.68rem',
                      color: 'rgba(255,255,255,0.5)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {ICONOS_TIPO[l.tipo] || l.tipo}
                  </div>
                  {l.obtenido ? (
                    <span style={estilos.fecha}>
                      Obtenido · {new Date(l.fecha_obtencion).toLocaleDateString('es')}
                    </span>
                  ) : (
                    <span style={estilos.bloqueo}>Bloqueado</span>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default LogrosPage;