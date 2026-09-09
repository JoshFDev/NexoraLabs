import { Navbar, Nav, Container } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../assets/Logo.png';
import api from '../api';
import CampanaNotificaciones from './CampanaNotificaciones';
import MenuUsuario from './MenuUsuario';

function NavBar() {
  const [usuario, setUsuario] = useState(() =>
    JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null')
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) return;
    api
      .get('/usuario/perfil')
      .then((res) => {
        const perfil = res.data;
        if (localStorage.getItem('token')) {
          localStorage.setItem('usuario', JSON.stringify(perfil));
        } else {
          sessionStorage.setItem('usuario', JSON.stringify(perfil));
        }
        setUsuario(perfil);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                {puedeCrear && (
                  <Nav.Link as={Link} to="/postulaciones" className="nav-link-nexora">Postulaciones</Nav.Link>
                )}
                <Nav.Link as={Link} to="/equipos" className="nav-link-nexora">Equipos</Nav.Link>
                <Nav.Link as={Link} to="/recursos" className="nav-link-nexora">Recursos</Nav.Link>
                <Nav.Link as={Link} to="/habilidades" className="nav-link-nexora">Habilidades</Nav.Link>
                <Nav.Link as={Link} to="/" className="nav-link-nexora">Panel</Nav.Link>
                <CampanaNotificaciones />
                <MenuUsuario usuario={usuario} onCerrarSesion={cerrarSesion} />
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