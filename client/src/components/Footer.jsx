import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="pie-nexora">
      <div className="container-fluid px-lg-4">
        <div className="pie-grid">
          <div className="pie-bloque pie-marca">
            <span className="pie-logo">Nexora<span>Labs</span></span>
            <p className="pie-descripcion">
              Comunidad para estudiantes, desarrolladores e ingenieros. Crea proyectos,
              forma tu equipo, aprende con recursos y encuentra oportunidades reales.
            </p>
          </div>

          <div className="pie-bloque">
            <h4>Plataforma</h4>
            <Link to="/explorar">Explorar proyectos</Link>
            <Link to="/equipos">Equipos</Link>
            <Link to="/recursos">Recursos</Link>
            <Link to="/ofertas">Ofertas y oportunidades</Link>
          </div>

          <div className="pie-bloque">
            <h4>Mi cuenta</h4>
            <Link to="/">Panel</Link>
            <Link to="/perfil">Editar perfil</Link>
            <Link to="/habilidades">Mis habilidades</Link>
            <Link to="/logros">Logros</Link>
          </div>

          <div className="pie-bloque">
            <h4>NexoraLabs</h4>
            <p className="pie-info">
              <strong>Acerca de nosotros</strong>
              <span>Impulsamos el talento conectando ideas, personas y proyectos.</span>
            </p>
            <p className="pie-info">
              <strong>Quiénes somos</strong>
              <span>Estudiantes, docentes y profesionales que colaboramos en proyectos reales.</span>
            </p>
            <p className="pie-info">
              <strong>¿Qué es NexoraLabs?</strong>
              <span>Un ecosistema educativo y profesional para crecer en tecnología.</span>
            </p>
          </div>
        </div>

        <div className="pie-barra">
          <span>© {new Date().getFullYear()} NexoraLabs. Todos los derechos reservados.</span>
          <span className="pie-frase">Hecho para crecer juntos.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;