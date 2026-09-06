import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/Logo.png';

function NavBar() {
  const [usuario] = useState(() =>
    JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null')
  );
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    navigate('/login');
  };

  const puedeCrear = usuario && ['admin', 'mentor', 'desarrollador', 'ingeniero'].includes(usuario.rol);

  return (
    <Navbar variant="dark" expand="lg" className="navbar-nexora">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={logo}
            alt="NexoraLabs"
            height="68"
            className="brand-firma"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {usuario ? (
              <>
                <Nav.Link as={Link} to="/explorar" className="nav-link-nexora">Explorar</Nav.Link>
                {puedeCrear && (
                  <Nav.Link as={Link} to="/crear-proyecto" className="nav-link-nexora">Crear proyecto</Nav.Link>
                )}
                <Nav.Link as={Link} to="/" className="nav-link-nexora">Panel</Nav.Link>
                <Nav.Link as={Link} to="/perfil" className="nav-link-nexora">Mi perfil</Nav.Link>
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