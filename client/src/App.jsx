import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import DashboardPage from './pages/DashboardPage';
import PerfilPage from './pages/PerfilPage';
import ExplorarProyectosPage from './pages/ExplorarProyectosPage';
import CrearProyectoPage from './pages/CrearProyectoPage';
import ProyectoDetallePage from './pages/ProyectoDetallePage';
import PostulacionesPage from './pages/PostulacionesPage';
import RutaProtegida from './components/RutaProtegida';

function App() {
  const { pathname } = useLocation();
  const esPaginaAuth = pathname === '/login' || pathname === '/registro';

  return (
    <>
      {!esPaginaAuth && <NavBar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route
          path="/perfil"
          element={
            <RutaProtegida>
              <PerfilPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/explorar"
          element={
            <RutaProtegida>
              <ExplorarProyectosPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/crear-proyecto"
          element={
            <RutaProtegida>
              <CrearProyectoPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/proyecto/:id"
          element={
            <RutaProtegida>
              <ProyectoDetallePage />
            </RutaProtegida>
          }
        />
        <Route
          path="/postulaciones"
          element={
            <RutaProtegida>
              <PostulacionesPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/"
          element={
            <RutaProtegida>
              <DashboardPage />
            </RutaProtegida>
          }
        />
      </Routes>
    </>
  );
}

export default App;