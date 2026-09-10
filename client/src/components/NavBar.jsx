import { Navbar, Nav, Container } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Fragment, useEffect, useState } from 'react';
import logo from '../assets/Logo.png';
import api from '../api';
import CampanaNotificaciones from './CampanaNotificaciones';
import MenuUsuario from './MenuUsuario';

const RUTAS = [
  { to: '/explorar', etiqueta: 'Explorar', para: 'todos' },
  { to: '/crear-proyecto', etiqueta: 'Crear proyecto', para: 'creador' },
  { to: '/postulaciones', etiqueta: 'Postulaciones', para: 'creador' },
  { to: '/equipos', etiqueta: 'Equipos', para: 'todos' },
  { to: '/recursos', etiqueta: 'Recursos', para: 'todos' },
  { to: '/ofertas', etiqueta: 'Ofertas', para: 'todos' },
];

function NavBar() {
  const [usuario, setUsuario] = useState(() =>
    JSON.parse(localStorage.getItem('usuario') || sessionStorage.getItem('usuario') || 'null')
  );
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
  const esActivo = (ruta) => (ruta === '/' ? pathname === '/' : pathname.startsWith(ruta));

  const ClaseEnlace = (ruta) => `nav-link-nexora${esActivo(ruta) ? ' activo' : ''}`;

  return (
    <Navbar variant="dark" expand="xl" className="navbar-nexora">
      <Container fluid className="px-lg-4">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center navbar-brand-nexora">
          <img
            src={logo}
            alt="NexoraLabs"
            height="78"
            className="brand-firma"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          {usuario && (
            <Nav className="navbar-enlaces ms-lg-5">
              {RUTAS.filter((r) => r.para === 'todos' || puedeCrear).map((r, i) => (
                <Fragment key={r.to}>
                  {i > 0 && <span className="nav-sep">/</span>}
                  <Nav.Link as={Link} to={r.to} className={ClaseEnlace(r.to)}>
                    {r.etiqueta}
                  </Nav.Link>
                </Fragment>
              ))}
            </Nav>
          )}
          <Nav className="navbar-utilidades ms-auto">
            {usuario ? (
              <>
                {usuario.rol === 'admin' && (
                  <Nav.Link as={Link} to="/admin" className={ClaseEnlace('/admin')}>
                    Panel admin
                  </Nav.Link>
                )}
                <Nav.Link as={Link} to="/" className={ClaseEnlace('/')}>
                  Panel
                </Nav.Link>
                <CampanaNotificaciones />
                <MenuUsuario usuario={usuario} onCerrarSesion={cerrarSesion} />
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-nexora">
                  Iniciar sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/registro" className="nav-link-nexora nav-cta">
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;