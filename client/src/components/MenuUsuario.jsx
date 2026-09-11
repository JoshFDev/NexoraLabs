import { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EliminarCuentaModal from './EliminarCuentaModal';

const ROL_LABEL = {
  admin: 'Admin',
  estudiante: 'Estudiante',
  desarrollador: 'Desarrollador',
  ingeniero: 'Ingeniero',
  mentor: 'Mentor / Docente',
};

function MenuUsuario({ usuario, onCerrarSesion }) {
  const inicial = (usuario.nombre || 'U').charAt(0).toUpperCase();
  const [eliminarAbierto, setEliminarAbierto] = useState(false);

  return (
    <Dropdown align="end" className="user-menu-wrapper">
      <Dropdown.Toggle as="div" className={`user-avatar user-avatar-btn${usuario.foto ? ' con-foto' : ''}`} aria-label="Menú de usuario">
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

        <Dropdown.Item as={Link} to={`/usuario/${usuario._id || usuario.id}`}>
          <span className="material-symbols-outlined">account_circle</span>
          Ver perfil
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/perfil">
          <span className="material-symbols-outlined">edit</span>
          Editar perfil
        </Dropdown.Item>
        <Dropdown.Divider className="user-menu-sep" />
        <Dropdown.Item as={Link} to="/habilidades">
          <span className="material-symbols-outlined">workspace_premium</span>
          Mis habilidades
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/logros">
          <span className="material-symbols-outlined">emoji_events</span>
          Logros
        </Dropdown.Item>
        <Dropdown.Divider className="user-menu-sep" />
        <Dropdown.Item className="user-menu-cerrar" onClick={onCerrarSesion}>
          <span className="material-symbols-outlined">logout</span>
          Cerrar sesión
        </Dropdown.Item>
        <Dropdown.Item className="user-menu-eliminar" onClick={() => setEliminarAbierto(true)}>
          <span className="material-symbols-outlined">delete_forever</span>
          Eliminar cuenta
        </Dropdown.Item>
      </Dropdown.Menu>
      <EliminarCuentaModal mostrar={eliminarAbierto} onCerrar={() => setEliminarAbierto(false)} />
    </Dropdown>
  );
}

export default MenuUsuario;