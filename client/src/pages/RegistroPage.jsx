import { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function RegistroPage() {
  const [usuario, setUsuario] = useState({ nombre: '', email: '', password: '', rol: 'estudiante' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const cambiar = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);
    try {
      await api.post('/usuario/registro', usuario);
      setExito('Cuenta creada. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '420px' }}>
      <Card>
        <Card.Header className="bg-dark text-white">Crear cuenta</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {exito && <Alert variant="success">{exito}</Alert>}
          <Form onSubmit={submit}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control name="nombre" value={usuario.nombre} onChange={cambiar} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" name="email" value={usuario.email} onChange={cambiar} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" name="password" value={usuario.password} onChange={cambiar} required minLength={6} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="rol">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="rol" value={usuario.rol} onChange={cambiar}>
                <option value="estudiante">Estudiante</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col>
                <Button type="submit" variant="primary" disabled={cargando}>
                  {cargando ? 'Creando...' : 'Registrarse'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegistroPage;