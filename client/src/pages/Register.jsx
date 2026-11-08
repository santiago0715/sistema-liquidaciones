import React, { useState } from 'react';
import API from '../config'; // <-- Usamos la instancia centralizada
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, CreditCard, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const formatRut = (value) => {
    let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length === 0) return '';

    let cuerpo = clean.slice(0, -1);
    let dv = clean.slice(-1);

    if (cuerpo.length > 0) {
      cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${cuerpo}-${dv}`;
    } else {
      return dv;
    }
  };

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value);
    setRut(formatted);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor, verifíquelas.');
      return;
    }

    try {
      await API.post('/api/auth/register', {
        nombre,
        rut,
        email,
        password,
        rol: 'user'
      });

      setSuccess('¡Usuario registrado con éxito! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el usuario. Verifique los datos.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-slate-800">
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Registro de Usuario
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Crea una cuenta institucional para el sistema
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center space-x-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Completo</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">RUT</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <CreditCard className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                maxLength={12}
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                value={rut}
                onChange={handleRutChange}
                placeholder="12.345.678-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-12 py-2.5 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirmar Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-12 py-2.5 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-medium shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 focus:outline-none transition-all text-sm mt-2"
          >
            Registrar Usuario
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}