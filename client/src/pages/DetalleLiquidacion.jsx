import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';

export default function DetalleLiquidacion() {
  const { id } = useParams();
  const [liquidacion, setLiquidacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLiquidacion = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/liquidaciones/${id}`);
        setLiquidacion(response.data);
      } catch (err) {
        setError('No se pudo cargar la liquidación solicitada.');
      } finally {
        setLoading(false);
      }
    };
    fetchLiquidacion();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-100 p-10 text-center">Cargando documento...</div>;
  if (error) return <div className="min-h-screen bg-slate-950 text-red-400 p-10 text-center">{error}</div>;
  if (!liquidacion) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 print:bg-white print:text-slate-900 print:p-0">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link 
            to="/historial"
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Historial</span>
          </Link>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>

        {/* Documento Formal de Liquidación con Logo */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl print:bg-white print:border-none print:shadow-none print:p-2 text-slate-100 print:text-slate-900 print:text-[11px]">
          
          {/* Encabezado con Logo y Empresa */}
          <div className="flex justify-between items-center border-b border-slate-800 print:border-slate-300 pb-4 mb-4">
            <div className="flex items-center gap-4">
              {liquidacion.empresaLogo && (
                <img src={liquidacion.empresaLogo} alt="Logo Empresa" className="h-12 w-12 object-contain rounded-lg border border-slate-700 print:border-slate-300 bg-white p-1" />
              )}
              <div>
                <h1 className="text-xl font-black uppercase tracking-wide text-indigo-400 print:text-indigo-900">{liquidacion.empresaRazonSocial}</h1>
                <p className="text-xs print:text-[10px] text-slate-400 print:text-slate-600 mt-0.5">RUT Empresa: {liquidacion.empresaRut}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block bg-indigo-600/20 text-indigo-300 print:bg-indigo-100 print:text-indigo-800 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-xs print:text-[10px] font-bold uppercase">
                Liquidación de Sueldo
              </span>
              <p className="text-xs print:text-[10px] font-semibold text-slate-300 print:text-slate-700 mt-1">Periodo: {liquidacion.periodo}</p>
            </div>
          </div>

          {/* Datos del Trabajador */}
          <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-xl p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm print:text-[11px]">
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block uppercase font-semibold">Trabajador</span>
              <span className="font-bold text-slate-100 print:text-slate-900">{liquidacion.trabajadorNombre}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block uppercase font-semibold">RUT</span>
              <span className="font-medium text-slate-200 print:text-slate-800">{liquidacion.trabajadorRut}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-slate-500 block uppercase font-semibold">Días Trabajados</span>
              <span className="font-medium text-slate-200 print:text-slate-800">{liquidacion.diasTrabajados} días</span>
            </div>
          </div>

          {/* Tablas de Haberes y Descuentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            
            <div className="border border-slate-800 print:border-slate-300 rounded-xl p-3 bg-slate-950/30 print:bg-white">
              <h3 className="text-xs print:text-[10px] font-bold uppercase text-indigo-400 print:text-indigo-800 mb-2 border-b border-slate-800 print:border-slate-200 pb-1.5">Haberes (Ingresos)</h3>
              <div className="space-y-1.5 text-xs print:text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400 print:text-slate-600">Sueldo Base:</span>
                  <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.sueldoBase?.toLocaleString('es-CL')}</span>
                </div>
                {liquidacion.horasExtrasMonto > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">Horas Extras:</span>
                    <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.horasExtrasMonto?.toLocaleString('es-CL')}</span>
                  </div>
                )}
                {liquidacion.responsabilidadCaja > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">Responsabilidad de Caja:</span>
                    <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.responsabilidadCaja?.toLocaleString('es-CL')}</span>
                  </div>
                )}
                
                {liquidacion.bonosDinamicos?.map((bono, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">{bono.nombre}:</span>
                    <span className="font-medium text-slate-200 print:text-slate-900">${bono.monto?.toLocaleString('es-CL')}</span>
                  </div>
                ))}

                {liquidacion.diasFaltadosMonto > 0 && (
                  <div className="flex justify-between text-red-400 print:text-red-600">
                    <span>Descuento Inasistencias:</span>
                    <span>-${liquidacion.diasFaltadosMonto?.toLocaleString('es-CL')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 print:border-slate-200 flex justify-between font-bold text-indigo-300 print:text-indigo-900">
                  <span>Total Imponible:</span>
                  <span>${liquidacion.totalImponible?.toLocaleString('es-CL')}</span>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800 print:border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">Colación:</span>
                    <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.colacion?.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">Movilización:</span>
                    <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.movilizacion?.toLocaleString('es-CL')}</span>
                  </div>
                  {liquidacion.viaticos > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 print:text-slate-600">Viáticos / Gastos:</span>
                      <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.viaticos?.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-emerald-400 print:text-emerald-700">
                    <span>Total No Imponible:</span>
                    <span>${liquidacion.totalNoImponible?.toLocaleString('es-CL')}</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="border border-slate-800 print:border-slate-300 rounded-xl p-3 bg-slate-950/30 print:bg-white flex flex-col justify-between">
              <div>
                <h3 className="text-xs print:text-[10px] font-bold uppercase text-red-400 print:text-red-800 mb-2 border-b border-slate-800 print:border-slate-200 pb-1.5">Descuentos Legales</h3>
                <div className="space-y-1.5 text-xs print:text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">AFP ({liquidacion.afpNombre}):</span>
                    <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.afpMonto?.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">Salud ({liquidacion.saludInstitucion}):</span>
                    <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.saludMonto?.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 print:text-slate-600">Seguro Cesantía (0.6%):</span>
                    <span className="font-medium text-slate-200 print:text-slate-900">${liquidacion.seguroCesantia?.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 print:border-slate-200 flex justify-between font-bold text-red-400 print:text-red-700 text-xs print:text-[11px] mt-4">
                <span>Total Descuentos:</span>
                <span>-${liquidacion.totalDescuentos?.toLocaleString('es-CL')}</span>
              </div>
            </div>

          </div>

          <div className="bg-indigo-950/40 print:bg-slate-100 border border-indigo-500/30 print:border-slate-300 rounded-xl p-3.5 flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
            <div>
              <span className="text-[10px] text-indigo-300 print:text-slate-700 block uppercase font-semibold">Total Haberes (Bruto)</span>
              <span className="text-lg print:text-base font-bold text-slate-100 print:text-slate-900">${liquidacion.totalHaberes?.toLocaleString('es-CL')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-300 print:text-emerald-800 block uppercase font-extrabold">Líquido a Pagar</span>
              <span className="text-xl print:text-lg font-black text-emerald-400 print:text-emerald-700">${liquidacion.sueldoLiquido?.toLocaleString('es-CL')}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-8 text-center text-xs print:text-[10px] text-slate-400 print:text-slate-600">
            <div>
              <div className="border-t border-slate-600 print:border-slate-400 pt-1.5 w-3/4 mx-auto">
                Firma Empleador / Representante
              </div>
            </div>
            <div>
              <div className="border-t border-slate-600 print:border-slate-400 pt-1.5 w-3/4 mx-auto">
                Firma Trabajador
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}