import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import DashboardPage from './pages/DashboardPage';
import RutaProtegida from './components/RutaProtegida';

function App() {
  return (
    <>
      <NavBar />
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