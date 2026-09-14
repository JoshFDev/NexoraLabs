import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { leerUsuario } from '../utils/perfil';
import { useToast } from '../components/ToastContext';
import './ProyectosPage.css';

const ETIQUETAS_ESTADO = {
  borrador: 'Borrador',
  buscando_equipo: 'Buscando equipo',
  en_desarrollo: 'En desarrollo',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado'
};

const ETIQUETAS_NIVEL = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  experto: 'Experto'
};

function MisProyectosPage() {
  const usuario = leerUsuario();
  const navigate = useNavigate();
  const { mostrar } = useToast();

  const [proyectos, setProyectos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null);

  const puedeCrear = usuario && ['admin', 'mentor', 'desarrollador', 'ingeniero'].includes(usuario.rol);

  const cargar = () => {
    setCargando(true);
    api
      .get(`/proyectos?creador=${usuario._id || usuario.id}&limite=100&orden=recientes`)
      .then((res) => {
        setProyectos(res.data.proyectos || []);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar tus proyectos'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eliminar = async (id) => {
    setProyectoAEliminar(null);
    try {
      await api.delete(`/proyecto/${id}`);
      setProyectos((prev) => (prev || []).filter((p) => String(p._id) !== String(id)));
      mostrar('exito', 'El proyecto se dio de baja correctamente.', 'Proyecto eliminado');
    } catch (err) {
      setError(err.response?.data?.error || 'No pudimos eliminar el proyecto.');
    }
  };

  return (
    <div className="proyectos-pagina">
      <Container fluid className="pt-4 px-lg-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
          <h2 className="proyectos-titulo mb-0">Mis proyectos</h2>
          {puedeCrear && (
            <Button className="proyectos-boton" as={Link} to="/crear-proyecto">
              + Nuevo proyecto
            </Button>
          )}
        </div>
        <p className="proyectos-subtitulo mb-4">Aquí solo ves los proyectos que creaste.</p>

        {error && <Alert variant="danger">{error}</Alert>}

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : proyectos.length === 0 ? (
          <div className="dash-vacio">
            <span className="dash-vacio-icono">
              <span className="material-symbols-outlined">folder_open</span>
            </span>
            <p>
              {puedeCrear ? 'Aún no has creado proyectos. Publica tu primera idea.' : 'Aún no has creado proyectos.'}
            </p>
            {puedeCrear && (
              <Button size="sm" className="proyectos-boton" as={Link} to="/crear-proyecto">
                Crear mi primer proyecto
              </Button>
            )}
          </div>
        ) : (
          <Row className="g-4">
            {proyectos.map((p) => (
              <Col key={String(p._id)} lg={6}>
                <article className="proyecto-fila h-100">
                  <div className="proyecto-fila-cabecera">
                    <h3 className="proyecto-titulo-tarjeta mb-1">{p.titulo}</h3>
                    <span className="proyecto-fila-flecha" aria-hidden="true">
                      →
                    </span>
                  </div>
                  <div className="proyecto-meta mb-2">
                    <span className="proyecto-badge">{ETIQUETAS_ESTADO[p.estado] || p.estado}</span>
                    {ETIQUETAS_NIVEL[p.nivel_dificultad] && (
                      <span className="proyecto-badge">{ETIQUETAS_NIVEL[p.nivel_dificultad]}</span>
                    )}
                    {p.categoria && <span className="proyecto-badge">{p.categoria}</span>}
                    <span className="proyecto-badge">{p.integrantes_maximos || 1} integrante(s)</span>
                  </div>
                  <p className="proyecto-descripcion">
                    {p.descripcion.length > 160 ? `${p.descripcion.slice(0, 160)}…` : p.descripcion}
                  </p>
                  <footer className="proyecto-creador">
                    Creado {new Date(p.fecha_creacion).toLocaleDateString('es')}
                  </footer>
                  <div className="equipo-acciones mt-2">
                    <Button size="sm" className="proyectos-boton" onClick={() => navigate(`/proyecto/${p._id}`)}>
                      Ver proyecto
                    </Button>
                    {puedeCrear && (
                      <Button
                        size="sm"
                        variant="outline-light"
                        className="proyectos-boton"
                        onClick={() => navigate(`/crear-proyecto?editar=${p._id}`)}
                      >
                        Editar
                      </Button>
                    )}
                    {puedeCrear && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="proyectos-boton"
                        onClick={() => setProyectoAEliminar(p)}
                      >
                        Dar de baja
                      </Button>
                    )}
                  </div>
                </article>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Modal show={!!proyectoAEliminar} onHide={() => setProyectoAEliminar(null)} centered>
        <Modal.Header closeButton className="proyecto-modal-cabecera">
          <Modal.Title className="proyectos-titulo" style={{ fontSize: '1.05rem' }}>
            Solicitar la baja de un proyecto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            Vas a enviar la solicitud para dar de baja el proyecto <strong>"{proyectoAEliminar?.titulo}"</strong>.
          </p>
          <p className="proyectos-subtitulo mb-0" style={{ fontSize: '0.85rem' }}>
            El proyecto dejará de estar visible para la comunidad y los integrantes serán notificados de la salida. Esta
            acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer className="proyecto-modal-pie">
          <Button variant="outline-light" className="proyectos-boton" onClick={() => setProyectoAEliminar(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="proyectos-boton"
            onClick={() => proyectoAEliminar && eliminar(proyectoAEliminar._id)}
          >
            Enviar solicitud de baja
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default MisProyectosPage;
