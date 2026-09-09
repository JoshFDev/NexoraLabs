import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ROL_LABEL = {
  admin: 'Admin',
  estudiante: 'Estudiante',
  desarrollador: 'Desarrollador',
  ingeniero: 'Ingeniero',
  mentor: 'Mentor / Docente',
};

function MenuUsuario({ usuario, onCerrarSesion }) {
  const inicial = (usuario.nombre || 'U').charAt(0).toUpperCase();

  return (
    <Dropdown align="end" className="user-menu-wrapper">
      <Dropdown.Toggle as="div" className="user-avatar user-avatar-btn" aria-label="Menú de usuario">
        {usuario.foto ? (
          <img src={usuario.foto} alt={`Foto de ${usuario.nombre}`} />
        ) : (
          inicial
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="user-menu">
        <div className="user-menu-cabeza">
          <span className="user-menu-avatar">
            {usuario.foto ? (
              <img src={usuario.foto} alt={`Foto de ${usuario.nombre}`} />
            ) : (
              inicial
            )}
          </span>
          <span className="user-menu-datos">
            <strong>{usuario.nombre} {usuario.apellido_paterno || ''}</strong>
            <span>{ROL_LABEL[usuario.rol] || usuario.rol}</span>
          </span>
        </div>

        <Dropdown.Item as={Link} to="/perfil">Editar perfil</Dropdown.Item>
        <Dropdown.Divider className="user-menu-sep" />
        <Dropdown.Item className="user-menu-cerrar" onClick={onCerrarSesion}>
          Cerrar sesión
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default MenuUsuario;