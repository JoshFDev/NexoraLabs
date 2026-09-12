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
  const [vibrando, setVibrando] = useState(false);
  const [verPreferencias, setVerPreferencias] = useState(false);
  const [preferencias, setPreferencias] = useState(null);
  const [cargandoPrefs, setCargandoPrefs] = useState(false);
  const [guardandoPrefs, setGuardandoPrefs] = useState(false);
  const [avisoPrefs, setAvisoPrefs] = useState('');
  const temporizadorRef = useRef(null);
  const prevNoLeidas = useRef(0);
  const abiertaRef = useRef(false);

  useEffect(() => {
    abiertaRef.current = abierta;
  }, [abierta]);

  useEffect(() => {
    if (vibrando) {
      const t = setTimeout(() => setVibrando(false), 1500);
      return () => clearTimeout(t);
    }
  }, [vibrando]);

  const cargar = useCallback(async (silencioso = true) => {
    if (!silencioso) setCargando(true);
    try {
      const res = await api.get('/notificaciones?limite=25');
      const lista = res.data.notificaciones || [];
      const conteo = res.data.no_leidas || 0;
      setNotificaciones(lista);
      setNoLeidas(conteo);
      if (!abiertaRef.current && conteo > prevNoLeidas.current) {
        setVibrando(true);
      }
      prevNoLeidas.current = conteo;
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
    else {
      setVerPreferencias(false);
      setPreferencias(null);
      setAvisoPrefs('');
    }
  };

  const abrirPreferencias = async () => {
    setVerPreferencias(true);
    setAvisoPrefs('');
    if (preferencias) return;
    setCargandoPrefs(true);
    try {
      const res = await api.get('/usuario/perfil');
      const prefs = res.data.preferencias_notificaciones || {};
      setPreferencias({
        correo: prefs.correo !== false,
        correo_aceptaciones: prefs.correo_aceptaciones !== false,
        correo_intereses: prefs.correo_intereses !== false,
      });
    } catch {
      setAvisoPrefs('No pudimos cargar tus preferencias.');
    } finally {
      setCargandoPrefs(false);
    }
  };

  const guardarPreferencias = async () => {
    if (!preferencias) return;
    setGuardandoPrefs(true);
    setAvisoPrefs('');
    try {
      await api.put('/usuario/perfil', { preferencias_notificaciones: preferencias });
      localStorage.setItem('preferencias_notificaciones', JSON.stringify(preferencias));
      setAvisoPrefs('Preferencias guardadas.');
    } catch {
      setAvisoPrefs('No pudimos guardar tus preferencias. Inténtalo de nuevo.');
    } finally {
      setGuardandoPrefs(false);
    }
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
      <Dropdown.Toggle as="span" className={`notif-campana${vibrando ? ' vibrando' : ''}`} aria-label="Notificaciones">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}
        >
          notifications
        </span>
        {noLeidas > 0 && <span className="notif-badge">{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notif-menu">
        <div className="notif-menu-cabeza">
          <strong>{verPreferencias ? 'Preferencias' : 'Notificaciones'}</strong>
          <div className="notif-menu-acciones">
            {verPreferencias ? (
              <button type="button" className="notif-volver" onClick={() => { setVerPreferencias(false); setAvisoPrefs(''); }}>
                <span aria-hidden="true">←</span> Lista
              </button>
            ) : (
              <>
                <span className="notif-engranaje" title="Preferencias de notificación" role="button" tabIndex={0} aria-label="Preferencias de notificación" onClick={abrirPreferencias} onKeyDown={(e) => e.key === 'Enter' && abrirPreferencias()}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                </span>
                {noLeidas > 0 && (
                  <button type="button" className="notif-marcar-todas" onClick={marcarTodas}>
                    Marcar todas
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {verPreferencias ? (
          <div className="notif-preferencias">
            <p className="notif-preferencias-intro">
              Recuerda: esto solo afecta a los correos. Las notificaciones dentro de la plataforma siempre llegan.
            </p>
            {cargandoPrefs ? (
              <div className="notif-vacio">
                <Spinner animation="border" size="sm" variant="secondary" />
              </div>
            ) : (
              <>
                <label className="notif-preferencia">
                  <input
                    type="checkbox"
                    checked={!!preferencias?.correo}
                    onChange={(e) => setPreferencias((p) => ({ ...p, correo: e.target.checked }))}
                  />
                  <span>
                    <strong>Recibir avisos por correo</strong>
                    <small>Activa o apaga el envío de todos los correos.</small>
                  </span>
                </label>
                <label className={`notif-preferencia${preferencias?.correo === false ? ' inactiva' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!preferencias?.correo_aceptaciones}
                    disabled={preferencias?.correo === false}
                    onChange={(e) => setPreferencias((p) => ({ ...p, correo_aceptaciones: e.target.checked }))}
                  />
                  <span>
                    <strong>Aceptaciones y rechazos</strong>
                    <small>Postulaciones, solicitudes y miembros de equipo.</small>
                  </span>
                </label>
                <label className={`notif-preferencia${preferencias?.correo === false ? ' inactiva' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!preferencias?.correo_intereses}
                    disabled={preferencias?.correo === false}
                    onChange={(e) => setPreferencias((p) => ({ ...p, correo_intereses: e.target.checked }))}
                  />
                  <span>
                    <strong>Proyectos, ofertas y recursos nuevos</strong>
                    <small>Recomendaciones según tus intereses.</small>
                  </span>
                </label>
                {avisoPrefs && <p className={`notif-preferencias-aviso${avisoPrefs.includes('guardadas') ? ' ok' : ''}`}>{avisoPrefs}</p>}
                <button type="button" className="notif-preferencias-guardar" onClick={guardarPreferencias} disabled={guardandoPrefs || !preferencias}>
                  {guardandoPrefs && <Spinner as="span" animation="border" size="sm" className="me-2" />}
                  Guardar preferencias
                </button>
              </>
            )}
          </div>
        ) : cargando && notificaciones.length === 0 ? (
          <div className="notif-vacio">
            <Spinner animation="border" size="sm" variant="secondary" />
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="notif-vacio">
            <span className="material-symbols-outlined">notifications_off</span>
            No tienes notificaciones.
          </div>
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