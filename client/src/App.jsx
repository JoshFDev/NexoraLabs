import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import DashboardPage from './pages/DashboardPage';
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