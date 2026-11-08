import React, { useState } from 'react';
import API from '../config'; // Importa la instancia configurada con tu variable de entorno
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Puede ser correo o RUT
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Función para formatear el RUT automáticamente si el usuario comienza ingresando números
  const formatRut = (value) => {
    let clean = value.replace(/[^0-9kK@.]/g, '').toUpperCase();
    
    // Si contiene '@', asumimos que es un correo electrónico y no aplicamos formato de RUT
    if (clean.includes('@')) {
      return value;
    }

    let numbersOnly = clean.replace(/[^0-9kK]/g, '');
    if (numbersOnly.length === 0) return '';

    let cuerpo = numbersOnly.slice(0, -1);
    let dv = numbersOnly.slice(-1);

    if (cuerpo.length > 0) {
      cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${cuerpo}-${dv}`;
    } else {
      return dv;
    }
  };

  const handleIdentifierChange = (e) => {
    const formatted = formatRut(e.target.value);
    setIdentifier(formatted);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Petición usando la instancia centralizada (apunta dinámicamente a Railway o localhost)
      const response = await API.post('/api/auth/login', {
        email: identifier, // Envía el RUT formateado o el correo al backend
        password
      });

      // Guardar el token y los datos del usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // --- VALIDACIÓN DE CAMBIO OBLIGATORIO DE CONTRASEÑA ---
      if (response.data.user.debeCambiarPassword) {
        navigate('/cambiar-password-obligatorio'); // Lo redirige a crear su clave nueva
      } else {
        navigate('/dashboard'); // Entra normal al panel
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas. Por favor, verifique sus datos.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-800">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Sistema de Liquidaciones
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Acceso institucional autorizado
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 flex items-center space-x-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Correo Electrónico o RUT
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                maxLength={30}
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
                value={identifier}
                onChange={handleIdentifierChange}
                placeholder="ejemplo@correo.com o 12.345.678-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-medium shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all text-sm"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Sección de Soporte e Enlace de Registro */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            ¿Olvidaste tu contraseña? <br />
            Comunícate con el administrador en{' '}
            <a 
              href="mailto:mizrain.aguerod@gmail.com" 
              className="font-medium text-indigo-600 hover:text-indigo-800 underline transition-colors"
            >
              mizrain.aguerod@gmail.com
            </a>
          </p>

          <div className="pt-2">
            <Link 
              to="/register" 
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              ¿No tienes una cuenta? Regístrate aquí
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}