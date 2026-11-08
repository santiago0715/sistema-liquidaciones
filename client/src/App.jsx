import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CrearLiquidacion from './pages/CrearLiquidacion';
import HistorialLiquidaciones from './pages/HistorialLiquidaciones';
import DetalleLiquidacion from './pages/DetalleLiquidacion'; // <--- ¡Asegúrate de tener esta importación!
import CambiarPasswordObligatorio from './pages/CambiarPasswordObligatorio';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/crear-liquidacion" element={<CrearLiquidacion />} />
        <Route path="/historial" element={<HistorialLiquidaciones />} />
        <Route path="/liquidacion/:id" element={<DetalleLiquidacion />} /> {/* <--- ¡Y esta ruta! */}
        <Route path="/cambiar-password-obligatorio" element={<CambiarPasswordObligatorio />} />
      </Routes>
    </Router>
  );
}

export default App;