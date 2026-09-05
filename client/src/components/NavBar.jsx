import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

function NavBar() {
  const [usuario] = useState(() => JSON.parse(localStorage.getItem('usuario') || 'null'));
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <Navbar variant="dark" expand="lg" className="navbar-nexora">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/Logo.png" alt="NexoraLabs" height="30" className="brand-firma" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {usuario ? (
              <>
                <Navbar.Text className="me-3">
                  {usuario.nombre} ({usuario.rol})
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={cerrarSesion}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
                <Nav.Link as={Link} to="/registro">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;