import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { leerUsuario, esPerfilCompleto } from '../utils/perfil';
import './ProyectosPage.css';

const ETIQUETAS_ESTADO = {
  borrador: 'Borrador',
  buscando_equipo: 'Buscando equipo',
  en_desarrollo: 'En desarrollo',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

function DashboardPage() {
  const [proyectos, setProyectos] = useState([]);
  const [recomendados, setRecomendados] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const usuario = leerUsuario();
  const perfilCompleto = esPerfilCompleto(usuario);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resProyectos, resRecomendados] = await Promise.all([
          api.get('/proyectos?limite=6'),
          api.get('/proyecto/recomendados').catch(() => null),
        ]);
        setProyectos(resProyectos.data.proyectos || []);
        setRecomendados(resRecomendados?.data || null);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar datos');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

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
      <Container className="pt-4">
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

        {recomendados && recomendados.proyectos?.length > 0 && (
          <section className="mb-4">
            <h3 className="proyectos-titulo mb-3" style={{ fontSize: '1.1rem' }}>
              Recomendados para ti
            </h3>
            <Row>
              {recomendados.proyectos.slice(0, 3).map((p) => (
                <Col md={6} lg={4} key={p._id} className="mb-3">
                  <article className="proyecto-tarjeta" onClick={() => navigate(`/proyecto/${p._id}`)}>
                    <div className="proyecto-tarjeta-cabecera">
                      <h4 className="proyecto-titulo-tarjeta">{p.titulo}</h4>
                      <span className="proyecto-badge">
                        {p.coincidencias} coincidencia{p.coincidencias !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="proyecto-descripcion">
                      {p.descripcion.length > 140 ? `${p.descripcion.slice(0, 140)}…` : p.descripcion}
                    </p>
                    <div className="proyecto-meta">
                      <span className="proyecto-badge">{ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
                      {p.categoria && <span className="proyecto-badge">{p.categoria}</span>}
                    </div>
                    <footer className="proyecto-creador">Creado por {p.creador_id?.nombre || 'anon'}</footer>
                  </article>
                </Col>
              ))}
            </Row>
          </section>
        )}

        <section>
          <h3 className="proyectos-titulo mb-3" style={{ fontSize: '1.1rem' }}>
            Proyectos recientes
          </h3>
          {proyectos.length === 0 ? (
            <p className="proyectos-vacio">Todavía no hay proyectos publicados.</p>
          ) : (
            <Row>
              {proyectos.map((p) => (
                <Col md={6} lg={4} key={p._id} className="mb-3">
                  <article className="proyecto-tarjeta" onClick={() => navigate(`/proyecto/${p._id}`)}>
                    <div className="proyecto-tarjeta-cabecera">
                      <h4 className="proyecto-titulo-tarjeta">{p.titulo}</h4>
                    </div>
                    <p className="proyecto-descripcion">
                      {p.descripcion.length > 140 ? `${p.descripcion.slice(0, 140)}…` : p.descripcion}
                    </p>
                    <div className="proyecto-meta">
                      <span className="proyecto-badge">{ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
                      {p.categoria && <span className="proyecto-badge">{p.categoria}</span>}
                    </div>
                    <footer className="proyecto-creador">Creado por {p.creador_id?.nombre || 'anon'}</footer>
                  </article>
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