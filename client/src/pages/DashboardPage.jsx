import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert } from 'react-bootstrap';
import api from '../api';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resStats, resProyectos] = await Promise.all([
          api.get('/stats'),
          api.get('/proyectos')
        ]);
        setStats(resStats.data);
        setProyectos(resProyectos.data.proyectos || []);
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
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Panel general</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card bg="primary" text="white">
              <Card.Body>
                <Card.Title>{stats.total_usuarios}</Card.Title>
                <Card.Text>Usuarios</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="success" text="white">
              <Card.Body>
                <Card.Title>{stats.total_proyectos}</Card.Title>
                <Card.Text>Proyectos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="info" text="white">
              <Card.Body>
                <Card.Title>{stats.total_equipos}</Card.Title>
                <Card.Text>Equipos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card bg="warning" text="white">
              <Card.Body>
                <Card.Title>{stats.total_habilidades}</Card.Title>
                <Card.Text>Habilidades</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      <Card>
        <Card.Header>Proyectos</Card.Header>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    No hay proyectos todavía
                  </td>
                </tr>
              )}
              {proyectos.map((p) => (
                <tr key={p._id}>
                  <td>{p.titulo}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.estado}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DashboardPage;