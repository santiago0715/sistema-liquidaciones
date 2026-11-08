import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ArrowLeft, Building2, User, Calendar, DollarSign, Eye, Trash2 } from 'lucide-react';

export default function HistorialLiquidaciones() {
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiquidaciones();
  }, []);

  const fetchLiquidaciones = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/liquidaciones');
      setLiquidaciones(response.data);
    } catch (err) {
      setError('Error al cargar el historial de liquidaciones.');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una liquidación específica
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta liquidación?')) {
      try {
        await axios.delete(`http://localhost:5000/api/liquidaciones/${id}`);
        setLiquidaciones(liquidaciones.filter(l => l._id !== id));
        if (trabajadorSeleccionado) {
          // Actualizar lista del trabajador seleccionado
          setTrabajadorSeleccionado(prev => ({
            ...prev,
            liquidaciones: prev.liquidaciones.filter(l => l._id !== id)
          }));
        }
      } catch (err) {
        alert('Error al eliminar el documento.');
      }
    }
  };

  // Agrupar liquidaciones por Trabajador (RUT)
  const trabajadoresAgrupados = liquidaciones.reduce((acc, curr) => {
    if (!acc[curr.trabajadorRut]) {
      acc[curr.trabajadorRut] = {
        nombre: curr.trabajadorNombre,
        rut: curr.trabajadorRut,
        empresa: curr.empresaRazonSocial,
        liquidaciones: []
      };
    }
    acc[curr.trabajadorRut].liquidaciones.push(curr);
    return acc;
  }, {});

  const listaTrabajadores = Object.values(trabajadoresAgrupados);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Historial de Liquidaciones</h1>
            <p className="text-sm text-slate-400 mt-1">Gestión y registro de documentos generados por trabajador</p>
          </div>
          <Link 
            to="/dashboard"
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Panel</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500">Cargando registros...</div>
        ) : listaTrabajadores.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No hay liquidaciones registradas en el sistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Columna Izquierda: Lista de Trabajadores */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl h-fit">
              <h2 className="text-base font-bold text-indigo-400 mb-4 px-2">Trabajadores Registrados ({listaTrabajadores.length})</h2>
              <div className="space-y-2">
                {listaTrabajadores.map((t) => (
                  <div 
                    key={t.rut}
                    onClick={() => setTrabajadorSeleccionado(t)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${trabajadorSeleccionado?.rut === t.rut ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'}`}
                  >
                    <div className="font-semibold text-sm">{t.nombre}</div>
                    <div className="text-xs text-slate-400 mt-0.5">RUT: {t.rut}</div>
                    <div className="text-xs text-indigo-300 mt-1 font-medium">{t.liquidaciones.length} documento(s)</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha: Detalle de Liquidaciones del Trabajador Seleccionado */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              {trabajadorSeleccionado ? (
                <div>
                  <div className="mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white">{trabajadorSeleccionado.nombre}</h2>
                    <p className="text-xs text-slate-400 mt-1">RUT: {trabajadorSeleccionado.rut} | Empresa: {trabajadorSeleccionado.empresa}</p>
                  </div>

                  <h3 className="text-sm font-semibold uppercase text-indigo-400 mb-4">Historial de Liquidaciones (Ordenadas de más reciente a más antigua)</h3>

                  <div className="space-y-3">
                    {trabajadorSeleccionado.liquidaciones.map((liq) => (
                      <div key={liq._id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-indigo-400" />
                            <span className="font-bold text-sm text-slate-200">{liq.periodo}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Líquido a Pagar: <span className="text-emerald-400 font-bold">${liq.sueldoLiquido?.toLocaleString('es-CL')}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/liquidacion/${liq._id}`}
                            className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-indigo-500/30 flex items-center space-x-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Ver Detalle</span>
                          </Link>
                          <button 
                            onClick={() => handleDelete(liq._id)}
                            className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-1.5 rounded-lg transition-colors border border-red-500/30"
                            title="Eliminar liquidación"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500">
                  <User className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p>Selecciona un trabajador de la lista izquierda para ver su historial de liquidaciones.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}