import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import api from '../api';
import './ProyectosPage.css';

const ICONOS_TIPO = {
  crear_proyecto: { icono: 'rocket_launch', etiqueta: 'Creador' },
  completar_perfil: { icono: 'how_to_reg', etiqueta: 'Perfil' },
  postularse: { icono: 'connect_without_contact', etiqueta: 'Participación' },
  unirse_equipo: { icono: 'group', etiqueta: 'Equipo' },
  comentar: { icono: 'forum', etiqueta: 'Comunidad' },
  calificar_recurso: { icono: 'school', etiqueta: 'Aprendizaje' },
};

const estilos = {
  tarjeta: {
    position: 'relative',
    borderRadius: '0.5rem',
    border: '1px solid #e4e3ec',
    background: '#ffffff',
    padding: '1.1rem 1rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(43, 40, 64, 0.06)',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  obtenido: {
    borderColor: 'rgba(124, 58, 237, 0.45)',
    boxShadow: '0 0 0 1px rgba(124, 58, 237, 0.12)',
  },
  bloqueado: {
    background: '#f8f8fa',
    opacity: 0.72,
  },
  insignia: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '0.4rem',
    color: '#6D28D9',
    background: '#f3ecfd',
  },
  insigniaBloqueada: {
    color: '#a7a4b7',
    background: '#ecebf1',
  },
  bloqueo: {
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#9a96ab',
    border: '1px solid #d8d5e2',
    padding: '0.15rem 0.6rem',
    borderRadius: '999px',
  },
  fecha: {
    fontSize: '0.74rem',
    color: '#6D28D9',
    fontWeight: 600,
  },
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
            <span
              style={{
                fontSize: '0.78rem',
                color: '#6D28D9',
                fontWeight: 700,
                border: '1px solid rgba(109, 40, 217, 0.35)',
                background: '#f3ecfd',
                borderRadius: '0.4rem',
                padding: '0.3rem 0.7rem',
                whiteSpace: 'nowrap',
              }}
            >
              {datos.total_obtenidos}/{datos.total_logros}
            </span>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!datos && !error && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {datos && (
          <Row className="g-3">
            {datos.logros.map((l) => {
              const meta = ICONOS_TIPO[l.tipo] || { icono: 'workspace_premium', etiqueta: l.tipo };
              return (
                <Col key={l._id} xs={12} sm={6} lg={4} xl={3} className="d-flex">
                  <div
                    style={{
                      ...estilos.tarjeta,
                      ...(l.obtenido ? estilos.obtenido : estilos.bloqueado),
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span style={{ ...estilos.insignia, ...(!l.obtenido && estilos.insigniaBloqueada) }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          {meta.icono}
                        </span>
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: '#9a96ab',
                        }}
                      >
                        {meta.etiqueta}
                      </span>
                    </div>
                    <h4
                      className="proyectos-titulo mb-1"
                      style={{ fontSize: '0.98rem', lineHeight: 1.25 }}
                    >
                      {l.nombre}
                    </h4>
                    <p
                      className="proyectos-subtitulo"
                      style={{ fontSize: '0.8rem', flexGrow: 1, marginBottom: '0.75rem' }}
                    >
                      {l.descripcion}
                    </p>
                    {l.obtenido ? (
                      <span style={estilos.fecha}>
                        Obtenido · {new Date(l.fecha_obtencion).toLocaleDateString('es')}
                      </span>
                    ) : (
                      <span style={estilos.bloqueo}>Bloqueado</span>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default LogrosPage;