import { useCallback, useEffect, useRef, useState } from 'react';
import { Dropdown, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function haceCuanto(fecha) {
  if (!fecha) return '';
  const diferencia = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diferencia / 60000);
  if (min < 1) return 'ahora mismo';
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `hace ${dias} día${dias !== 1 ? 's' : ''}`;
  return new Date(fecha).toLocaleDateString('es');
}

function CampanaNotificaciones() {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierta, setAbierta] = useState(false);
  const [cargando, setCargando] = useState(false);
  const temporizadorRef = useRef(null);

  const cargar = useCallback(async (silencioso = true) => {
    if (!silencioso) setCargando(true);
    try {
      const res = await api.get('/notificaciones?limite=25');
      setNotificaciones(res.data.notificaciones || []);
      setNoLeidas(res.data.no_leidas || 0);
    } catch {
      if (!silencioso) setNoLeidas(0);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar(true);
    temporizadorRef.current = setInterval(() => cargar(true), 30000);
    return () => clearInterval(temporizadorRef.current);
  }, [cargar]);

  const alAbrir = (esAbierta) => {
    setAbierta(esAbierta);
    if (esAbierta) cargar(false);
  };

  const irANotificacion = async (n) => {
    try {
      if (!n.leida) {
        await api.put(`/notificacion/${n._id}/leida`);
        setNoLeidas((v) => Math.max(0, v - 1));
        setNotificaciones((prev) =>
          prev.map((x) => (String(x._id) === String(n._id) ? { ...x, leida: true } : x))
        );
      }
    } catch {
      // Si falla, igual navegamos
    }
    if (n.enlace) {
      navigate(n.enlace);
    }
  };

  const marcarTodas = async () => {
    try {
      await api.post('/notificaciones/marcar-todas');
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {
      // ignorar
    }
  };

  return (
    <Dropdown align="end" show={abierta} onToggle={alAbrir} autoClose="outside">
      <Dropdown.Toggle as="span" className="notif-campana" aria-label="Notificaciones">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {noLeidas > 0 && <span className="notif-badge">{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notif-menu">
        <div className="notif-menu-cabeza">
          <strong>Notificaciones</strong>
          {noLeidas > 0 && (
            <button type="button" className="notif-marcar-todas" onClick={marcarTodas}>
              Marcar todas como leídas
            </button>
          )}
        </div>

        {cargando && notificaciones.length === 0 ? (
          <div className="notif-vacio">
            <Spinner animation="border" size="sm" variant="secondary" />
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="notif-vacio">No tienes notificaciones.</div>
        ) : (
          <div className="notif-lista">
            {notificaciones.map((n) => (
              <button
                type="button"
                key={String(n._id)}
                className={`notif-item${n.leida ? '' : ' no-leida'}`}
                onClick={() => irANotificacion(n)}
              >
                <span className="notif-punto" />
                <span className="notif-contenido">
                  <span className="notif-titulo">{n.titulo}</span>
                  {n.mensaje && <span className="notif-mensaje">{n.mensaje}</span>}
                  <span className="notif-fecha">{haceCuanto(n.fecha)}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default CampanaNotificaciones;