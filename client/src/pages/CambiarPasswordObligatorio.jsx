import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../config'; // <-- Usamos la instancia centralizada
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function CambiarPasswordObligatorio() {
  const navigate = useNavigate();
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (nuevaPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await API.put('/api/auth/cambiar-password', {
        userId: userData.id,
        nuevaPassword
      });

      userData.debeCambiarPassword = false;
      localStorage.setItem('user', JSON.stringify(userData));

      alert('¡Contraseña actualizada con éxito! Ingresando al sistema...');
      navigate('/dashboard');
    } catch (err) {
      setError('Error al actualizar la contraseña.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-2xl border border-amber-500/20">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-center mb-2">Cambio de Contraseña Requerido</h2>
        <p className="text-sm text-slate-400 text-center mb-6">
          Un administrador ha restablecido tu clave. Por seguridad, debes ingresar una contraseña nueva antes de continuar.
        </p>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nueva Contraseña</label>
            <input 
              type="password"
              required
              placeholder="••••••••"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Confirmar Nueva Contraseña</label>
            <input 
              type="password"
              required
              placeholder="••••••••"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all text-sm mt-2 flex items-center justify-center gap-2"
          >
            <KeyRound className="h-4 w-4" /> Guardar Nueva Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}