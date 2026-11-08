import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../config'; // Importa la instancia configurada con tu variable de entorno
import { FileText, History, Shield, Users, UserPlus, AlertCircle, CheckCircle2, KeyRound, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nuevoUser, setNuevoUser] = useState({
    nombre: '',
    rut: '',
    email: '',
    password: '',
    rol: 'user'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.rol === 'admin') {
        fetchUsuarios();
      }
    }
  }, [navigate]);

  const fetchUsuarios = async () => {
    try {
      const res = await API.get('/api/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      setError('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Función de formato automático de RUT chileno
  const formatRut = (value) => {
    let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length === 0) return '';
    let cuerpo = clean.slice(0, -1);
    let dv = clean.slice(-1);
    if (cuerpo.length > 0) {
      cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${cuerpo}-${dv}`;
    }
    return dv;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rut') {
      setNuevoUser({ ...nuevoUser, rut: formatRut(value) });
    } else {
      setNuevoUser({ ...nuevoUser, [name]: value });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/api/usuarios/crear', nuevoUser);
      setSuccess('¡Cuenta de usuario creada con éxito!');
      setNuevoUser({ nombre: '', rut: '', email: '', password: '', rol: 'user' });
      fetchUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la cuenta.');
    }
  };

  const handleRoleChange = async (id, nuevoRol) => {
    try {
      await API.put(`/api/usuarios/${id}/rol`, { rol: nuevoRol });
      setSuccess('Rol actualizado correctamente');
      fetchUsuarios();
    } catch (err) {
      setError('Error al cambiar el rol.');
    }
  };

  // Función para restablecer la contraseña a los primeros 4 dígitos del RUT
  const handleResetPassword = async (id, nombreUsuario) => {
    if (window.confirm(`¿Estás seguro de restablecer la contraseña de ${nombreUsuario} a los primeros 4 dígitos de su RUT?`)) {
      try {
        setError('');
        setSuccess('');
        const res = await API.put(`/api/usuarios/${id}/reset-password`);
        setSuccess(res.data.message);
      } catch (err) {
        setError('Error al restablecer la contraseña.');
      }
    }
  };

  // NUEVA FUNCIÓN: Eliminar usuario por ID
  const handleDeleteUser = async (id, nombreUsuario) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la cuenta de ${nombreUsuario}?`)) {
      try {
        setError('');
        setSuccess('');
        await API.delete(`/api/usuarios/${id}`);
        setSuccess('Usuario eliminado correctamente del sistema.');
        fetchUsuarios();
      } catch (err) {
        setError(err.response?.data?.message || 'Error al eliminar el usuario.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera del Dashboard */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Sistema de Liquidaciones - Panel Admin</h1>
            <p className="text-sm text-slate-400 mt-1">Gestiona cuentas institucionales, calcula y genera los sueldos de forma segura.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-bold text-slate-200">{user?.nombre}</span>
              <span className="text-xs uppercase font-extrabold text-indigo-400">ROL: {user?.rol}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center space-x-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center space-x-3 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tarjetas de Acceso Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
            <div>
              <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-xl w-fit mb-4 border border-indigo-500/30">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Crear Nueva Liquidación</h2>
              <p className="text-sm text-slate-400 mb-6">Ingresa los datos del trabajador, haberes, descuentos previsionales y genera el cálculo automático.</p>
            </div>
            <Link 
              to="/crear-liquidacion" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl text-center shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" /> Nueva Liquidación
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
            <div>
              <div className="bg-emerald-600/20 text-emerald-400 p-3 rounded-xl w-fit mb-4 border border-emerald-500/30">
                <History className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Historial de Liquidaciones</h2>
              <p className="text-sm text-slate-400 mb-6">Consulta los registros anteriores guardados en la base de datos y exporta los documentos en PDF.</p>
            </div>
            <Link 
              to="/historial" 
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-xl text-center border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <History className="h-4 w-4" /> Ver Historial
            </Link>
          </div>

        </div>

        {/* Sección exclusiva para Administradores: Gestión de Cuentas */}
        {user?.rol === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Formulario para Crear Cuenta */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
              <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" /> Crear Nueva Cuenta
              </h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nombre Completo</label>
                  <input 
                    type="text"
                    name="nombre"
                    required
                    placeholder="Ej: María Soto"
                    value={nuevoUser.nombre}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">RUT</label>
                  <input 
                    type="text"
                    name="rut"
                    required
                    maxLength={12}
                    placeholder="Ej: 12.345.678-9"
                    value={nuevoUser.rut}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Correo Electrónico</label>
                  <input 
                    type="email"
                    name="email"
                    required
                    placeholder="Ej: usuario@empresa.cl"
                    value={nuevoUser.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Contraseña</label>
                  <input 
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={nuevoUser.password}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Rol de Acceso</label>
                  <select 
                    name="rol"
                    value={nuevoUser.rol}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="user">Usuario (Normal)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all text-sm mt-2"
                >
                  Registrar Cuenta
                </button>
              </form>
            </div>

            {/* Listado, Cambio de Roles y Restablecimiento de Contraseñas */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-indigo-400 mb-2 flex items-center gap-2">
                <Users className="h-5 w-5" /> Cuentas Registradas en el Sistema
              </h3>
              <p className="text-xs text-slate-400 mb-6">Listado general de usuarios y administradores con acceso a la plataforma.</p>
              
              {loadingUsers ? (
                <p className="text-slate-400 text-sm">Cargando usuarios...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                        <th className="py-3 px-3">Nombre / RUT</th>
                        <th className="py-3 px-3">Correo</th>
                        <th className="py-3 px-3">Rol</th>
                        <th className="py-3 px-3 text-center">Cambiar Rol</th>
                        <th className="py-3 px-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {usuarios.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-950/40">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-200">{u.nombre}</div>
                            <div className="text-xs text-slate-400">{u.rut}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-300 text-xs">{u.email}</td>
                          <td className="py-3 px-3">
                            {u.rol === 'admin' ? (
                              <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-lg text-xs font-bold">
                                <Shield className="h-3 w-3" /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg text-xs font-medium">
                                <Users className="h-3 w-3" /> Usuario
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <select
                              value={u.rol}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="user">Usuario</option>
                              <option value="admin">Administrador</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-center flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleResetPassword(u._id, u.nombre)}
                              title="Restablecer contraseña a los primeros 4 dígitos del RUT"
                              className="inline-flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              <span>Reset Clave</span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id, u.nombre)}
                              title="Eliminar usuario"
                              className="inline-flex items-center gap-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}