import { useEffect, useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
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

function useColumnas() {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const puntos = [
      { m: '(min-width: 1200px)', n: 4 },
      { m: '(min-width: 992px)', n: 3 },
      { m: '(min-width: 640px)', n: 2 },
    ];
    const mqs = puntos.map((p) => ({ ...p, q: window.matchMedia(p.m) }));
    const calcular = () => {
      const match = mqs.find((x) => x.q.matches);
      setCols(match ? match.n : 1);
    };
    calcular();
    mqs.forEach((x) => x.q.addEventListener('change', calcular));
    return () => mqs.forEach((x) => x.q.removeEventListener('change', calcular));
  }, []);
  return cols;
}

function LogrosPage() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const columnas = useColumnas();

  useEffect(() => {
    api
      .get('/mis-logros')
      .then((res) => setDatos(res.data))
      .catch((err) => setError(err.response?.data?.error || 'No pudimos cargar tus logros.'));
  }, []);

  const filas = [];
  if (datos) {
    for (let i = 0; i < datos.logros.length; i += columnas) {
      filas.push(datos.logros.slice(i, i + columnas));
    }
  }

  return (
    <div className="proyectos-pagina">
      <Container fluid className="px-lg-5">
        <div className="logros-cabecera">
          <div>
            <h2 className="proyectos-titulo mb-1">Mis logros</h2>
            <p className="proyectos-subtitulo mb-0">
              {datos
                ? `Has desbloqueado ${datos.total_obtenidos} de ${datos.total_logros} logros. Sigue participando para ganar los demás.`
                : 'Las insignias que consigues al crear, participar y aprender.'}
            </p>
          </div>
          {datos && (
            <div style={{ minWidth: '240px', flex: '1 1 280px', maxWidth: '400px' }}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="honeycomb-etiqueta">Progreso general</span>
                <span className="honeycomb-etiqueta">
                  {Math.round((datos.total_obtenidos / datos.total_logros) * 100)}%
                </span>
              </div>
              <div className="honeycomb-barra">
                <div
                  style={{
                    width: `${(datos.total_obtenidos / datos.total_logros) * 100}%`,
                  }}
                />
              </div>
              <div className="d-flex align-items-center justify-content-between gap-4 mt-2">
                <span className="honeycomb-leyenda">
                  <span className="honeycomb-leyenda-dot obtenido" />
                  Obtenido · {datos.total_obtenidos}
                </span>
                <span className="honeycomb-leyenda">
                  <span className="honeycomb-leyenda-dot bloqueado" />
                  Bloqueado · {datos.total_logros - datos.total_obtenidos}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!datos && !error && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {datos && (
          <div className="honeycomb" style={{ paddingTop: '0.5rem' }}>
            {filas.map((fila, idx) => (
              <div key={idx} className={`honeycomb-fila${idx % 2 ? ' desplazada' : ''}`}>
                {fila.map((l, j) => {
                  const meta = ICONOS_TIPO[l.tipo] || { icono: 'workspace_premium', etiqueta: l.tipo };
                  const retraso = Math.min((idx * 4 + j) * 0.03, 0.5);
                  return (
                    <div
                      key={l._id}
                      className={`honeycomb-celda${l.obtenido ? ' obtenido' : ''}`}
                      style={{ animationDelay: `${retraso}s` }}
                    >
                      <div className={`honeycomb-hex ${l.obtenido ? 'obtenido' : 'bloqueado'}`}>
                        <div className="honeycomb-hex-cuerpo">
                          <span className="honeycomb-hex-ico">
                            <span className="material-symbols-outlined">{meta.icono}</span>
                          </span>
                          <span className="honeycomb-hex-tipo">{meta.etiqueta}</span>
                          <h4 className="honeycomb-hex-titulo">{l.nombre}</h4>
                          <p className="honeycomb-hex-desc">{l.descripcion}</p>
                          <span className="honeycomb-hex-linea" />
                          <div className="honeycomb-hex-pie">
                            {l.obtenido ? (
                              `Obtenido · ${new Date(l.fecha_obtencion).toLocaleDateString('es')}`
                            ) : (
                              <>
                                <span className="material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: '-2px' }}>
                                  lock
                                </span>
                                &nbsp;Bloqueado
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="honeycomb-tooltip">
                        <span className="honeycomb-tooltip-tipo">{meta.etiqueta}</span>
                        <strong>{l.nombre}</strong>
                        <span className="honeycomb-tooltip-desc">{l.descripcion}</span>
                        {l.obtenido && (
                          <span className="honeycomb-tooltip-fecha">
                            Obtenido el {new Date(l.fecha_obtencion).toLocaleDateString('es')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

export default LogrosPage;