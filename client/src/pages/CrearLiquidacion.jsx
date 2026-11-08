import React, { useState, useEffect } from 'react';
import API from '../config'; // <-- Usamos la instancia centralizada
import { useNavigate, Link } from 'react-router-dom';
import { FileText, DollarSign, User, CreditCard, Building2, ArrowLeft, CheckCircle2, AlertCircle, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

const AFP_TASAS = {
  'Capital': 11.44,
  'Cuprum': 11.44,
  'Habitat': 11.27,
  'Modelo': 10.58,
  'PlanVital': 11.16,
  'ProVida': 11.45,
  'Uno': 10.49
};

export default function CrearLiquidacion() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    empresaRazonSocial: '',
    empresaRut: '',
    empresaLogo: '', 
    trabajadorNombre: '',
    trabajadorRut: '',
    mesPeriodo: 'Noviembre',
    anioPeriodo: '2026',
    diasTrabajados: 30,
    sueldoBase: '',
    horasExtrasCantidad: '',
    diasFaltadosCantidad: '',
    responsabilidadCaja: '',
    colacion: '',
    movilizacion: '',
    viaticos: '',
    afpNombre: 'Habitat',
    afpPorcentaje: 11.27,
    afpCustom: '', 
    saludInstitucion: 'Fonasa',
    saludPorcentaje: 7,
    saludMontoPersonalizado: '' 
  });

  const [empresasGuardadas, setEmpresasGuardadas] = useState({});
  const [trabajadoresGuardados, setTrabajadoresGuardados] = useState({});
  const [bonosList, setBonosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar datos previos de empresas y trabajadores desde el historial
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/api/liquidaciones');
        const unicasEmpresas = {};
        const unicosTrabajadores = {};

        res.data.forEach(item => {
          if (item.empresaRazonSocial && !unicasEmpresas[item.empresaRazonSocial]) {
            unicasEmpresas[item.empresaRazonSocial] = {
              rut: item.empresaRut,
              logo: item.empresaLogo || ''
            };
          }
          if (item.trabajadorNombre && !unicosTrabajadores[item.trabajadorNombre]) {
            unicosTrabajadores[item.trabajadorNombre] = item.trabajadorRut;
          }
        });

        setEmpresasGuardadas(unicasEmpresas);
        setTrabajadoresGuardados(unicosTrabajadores);
      } catch (err) {
        console.error('Error al cargar datos anteriores', err);
      }
    };
    fetchData();
  }, []);

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, empresaLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'trabajadorRut' || name === 'empresaRut') {
      setFormData({ ...formData, [name]: formatRut(value) });
      return;
    }

    if (name === 'empresaRazonSocial') {
      const empresaEncontrada = empresasGuardadas[value];
      setFormData(prev => ({
        ...prev,
        empresaRazonSocial: value,
        empresaRut: empresaEncontrada ? empresaEncontrada.rut : prev.empresaRut,
        empresaLogo: empresaEncontrada ? empresaEncontrada.logo : prev.empresaLogo
      }));
      return;
    }

    if (name === 'trabajadorNombre') {
      const rutEncontrado = trabajadoresGuardados[value];
      setFormData(prev => ({
        ...prev,
        trabajadorNombre: value,
        trabajadorRut: rutEncontrado ? rutEncontrado : prev.trabajadorRut
      }));
      return;
    }

    if (name === 'afpNombre') {
      if (value === 'Otra') {
        setFormData({ ...formData, afpNombre: value, afpPorcentaje: 11.0 });
      } else {
        setFormData({ ...formData, afpNombre: value, afpPorcentaje: AFP_TASAS[value] || 11.27 });
      }
      return;
    }

    const numericFields = [
      'diasTrabajados', 'sueldoBase', 'horasExtrasCantidad', 
      'diasFaltadosCantidad', 'responsabilidadCaja', 'colacion', 
      'movilizacion', 'viaticos', 'afpPorcentaje', 'saludPorcentaje', 
      'saludMontoPersonalizado'
    ];

    setFormData({
      ...formData,
      [name]: numericFields.includes(name) 
        ? (value === '' ? '' : Number(value)) 
        : value
    });
  };

  const handleAddBono = () => {
    setBonosList([...bonosList, { nombre: '', monto: '' }]);
  };

  const handleBonoChange = (index, field, value) => {
    const updated = [...bonosList];
    updated[index][field] = field === 'monto' ? (value === '' ? '' : Number(value)) : value;
    setBonosList(updated);
  };

  const handleRemoveBono = (index) => {
    setBonosList(bonosList.filter((_, i) => i !== index));
  };

  const sueldoBaseNum = Number(formData.sueldoBase) || 0;
  const horasExtrasCantNum = Number(formData.horasExtrasCantidad) || 0;
  const diasFaltadosCantNum = Number(formData.diasFaltadosCantidad) || 0;

  const valorHoraOrdinaria = sueldoBaseNum > 0 ? (sueldoBaseNum * 28) / 600 : 0;
  const valorHoraExtraUnitaria = valorHoraOrdinaria * 1.5;
  const horasExtrasMontoCalculado = Math.round(horasExtrasCantNum * valorHoraExtraUnitaria);

  const valorDiaTrabajo = sueldoBaseNum > 0 ? sueldoBaseNum / 30 : 0;
  const diasFaltadosMontoCalculado = Math.round(diasFaltadosCantNum * valorDiaTrabajo);

  const totalBonosDinamicos = bonosList.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0);
  
  const imponible = (sueldoBaseNum + horasExtrasMontoCalculado + (Number(formData.responsabilidadCaja) || 0) + totalBonosDinamicos) - diasFaltadosMontoCalculado;
  const noImponible = (Number(formData.colacion) || 0) + (Number(formData.movilizacion) || 0) + (Number(formData.viaticos) || 0);
  const totalHaberes = imponible + noImponible;

  const afpFinalNombre = formData.afpNombre === 'Otra' ? formData.afpCustom : formData.afpNombre;
  const afpPorcentajeNum = Number(formData.afpPorcentaje) || 0;
  const afpMonto = Math.round(imponible * (afpPorcentajeNum / 100));
  
  const saludMonto = formData.saludInstitucion === 'Fonasa' 
    ? Math.round(imponible * 0.07) 
    : (Number(formData.saludMontoPersonalizado) || 0);

  const seguroCesantia = Math.round(imponible * 0.006);
  const totalDescuentos = afpMonto + saludMonto + seguroCesantia;
  const sueldoLiquido = totalHaberes - totalDescuentos;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const periodoFinal = `${formData.mesPeriodo} ${formData.anioPeriodo}`;

    try {
      const payload = {
        empresaRazonSocial: formData.empresaRazonSocial,
        empresaRut: formData.empresaRut,
        empresaLogo: formData.empresaLogo,
        trabajadorNombre: formData.trabajadorNombre,
        trabajadorRut: formData.trabajadorRut,
        periodo: periodoFinal,
        diasTrabajados: Number(formData.diasTrabajados) || 30,
        horasExtrasMonto: horasExtrasMontoCalculado,
        diasFaltadosMonto: diasFaltadosMontoCalculado,
        sueldoBase: sueldoBaseNum,
        bonosDinamicos: bonosList,
        responsabilidadCaja: Number(formData.responsabilidadCaja) || 0,
        colacion: Number(formData.colacion) || 0,
        movilizacion: Number(formData.movilizacion) || 0,
        viaticos: Number(formData.viaticos) || 0,
        totalImponible: imponible,
        totalNoImponible: noImponible,
        totalHaberes: totalHaberes,
        afpNombre: afpFinalNombre,
        afpPorcentaje: afpPorcentajeNum,
        afpMonto: afpMonto,
        saludInstitucion: formData.saludInstitucion,
        saludPorcentaje: Number(formData.saludPorcentaje) || 7,
        saludMonto: saludMonto,
        seguroCesantia: seguroCesantia,
        totalDescuentos: totalDescuentos,
        sueldoLiquido: sueldoLiquido
      };

      await API.post('/api/liquidaciones/crear', payload);
      setSuccess('¡Liquidación guardada con éxito!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la liquidación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Nueva Liquidación de Sueldo</h1>
            <p className="text-sm text-slate-400 mt-1">Con autocompletado inteligente de empresa y trabajadores</p>
          </div>
          <Link 
            to="/dashboard"
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Link>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sección 1: Datos de la Empresa */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" /> 1. Datos del Empleador y Logotipo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Razón Social Empresa</label>
                <input 
                  type="text" 
                  name="empresaRazonSocial"
                  required
                  list="empresas-list"
                  placeholder="Ej: Constructora Limitada"
                  value={formData.empresaRazonSocial}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <datalist id="empresas-list">
                  {Object.keys(empresasGuardadas).map((emp, i) => (
                    <option key={i} value={emp} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">RUT Empresa</label>
                <input 
                  type="text" 
                  name="empresaRut"
                  required
                  maxLength={12}
                  placeholder="Ej: 76.543.210-k"
                  value={formData.empresaRut}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Logo de la Empresa (Opcional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl px-3 py-2 text-xs flex items-center gap-2 text-slate-300 w-full transition-colors">
                    <ImageIcon className="h-4 w-4 text-indigo-400" />
                    <span className="truncate">{formData.empresaLogo ? 'Logo cargado' : 'Subir imagen...'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {formData.empresaLogo && (
                    <img src={formData.empresaLogo} alt="Logo" className="h-10 w-10 object-contain rounded bg-white p-0.5 border border-slate-700" />
                  )}
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Periodo (Mes y Año)</label>
                <div className="flex gap-2 w-full md:w-1/3">
                  <select 
                    name="mesPeriodo"
                    value={formData.mesPeriodo}
                    onChange={handleInputChange}
                    className="w-3/5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    name="anioPeriodo"
                    required
                    placeholder="Año"
                    value={formData.anioPeriodo}
                    onChange={handleInputChange}
                    className="w-2/5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Sección 2: Datos del Trabajador */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" /> 2. Datos del Trabajador y Asistencia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  name="trabajadorNombre"
                  required
                  list="trabajadores-list"
                  value={formData.trabajadorNombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <datalist id="trabajadores-list">
                  {Object.keys(trabajadoresGuardados).map((trab, i) => (
                    <option key={i} value={trab} />
                  ))}
                </datalist>
                <span className="text-[10px] text-slate-500 mt-1 block">Al escribir un trabajador registrado, su RUT aparecerá solo</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">RUT Trabajador</label>
                <input 
                  type="text" 
                  name="trabajadorRut"
                  required
                  maxLength={12}
                  value={formData.trabajadorRut}
                  onChange={handleInputChange}
                  placeholder="Ej: 12.345.678-9"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Días Trabajados</label>
                <input 
                  type="number" 
                  name="diasTrabajados"
                  min="1" max="30"
                  required
                  value={formData.diasTrabajados}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 3: Haberes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
              <DollarSign className="h-5 w-5" /> 3. Haberes y Asistencias Automáticas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Sueldo Base ($)</label>
                <input 
                  type="number" 
                  name="sueldoBase"
                  required
                  placeholder="Ej: 500000"
                  value={formData.sueldoBase}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-indigo-300">Horas Extras (Cant.)</label>
                  {horasExtrasMontoCalculado > 0 && (
                    <span className="text-xs font-bold text-emerald-400">+${horasExtrasMontoCalculado.toLocaleString('es-CL')}</span>
                  )}
                </div>
                <input 
                  type="number" 
                  name="horasExtrasCantidad"
                  min="0"
                  value={formData.horasExtrasCantidad}
                  onChange={handleInputChange}
                  placeholder="Ej: 4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Responsabilidad de Caja ($)</label>
                <input 
                  type="number" 
                  name="responsabilidadCaja"
                  value={formData.responsabilidadCaja}
                  onChange={handleInputChange}
                  placeholder="Ej: 20000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-red-400">Días Faltados (Cant.)</label>
                  {diasFaltadosMontoCalculado > 0 && (
                    <span className="text-xs font-bold text-red-300">-${diasFaltadosMontoCalculado.toLocaleString('es-CL')}</span>
                  )}
                </div>
                <input 
                  type="number" 
                  name="diasFaltadosCantidad"
                  min="0" max="30"
                  value={formData.diasFaltadosCantidad}
                  onChange={handleInputChange}
                  placeholder="Ej: 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none text-red-300"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-semibold uppercase text-indigo-300">Bonos Específicos del Trabajador</label>
                <button
                  type="button"
                  onClick={handleAddBono}
                  className="flex items-center space-x-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-indigo-500/30"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Bono</span>
                </button>
              </div>

              {bonosList.map((bono, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input 
                    type="text" 
                    placeholder="Nombre del bono"
                    value={bono.nombre}
                    onChange={(e) => handleBonoChange(index, 'nombre', e.target.value)}
                    className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Monto ($)"
                    value={bono.monto}
                    onChange={(e) => handleBonoChange(index, 'monto', e.target.value)}
                    className="w-1/4 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveBono(index)}
                    className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-xl transition-colors border border-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold uppercase text-emerald-400 mb-1">Colación ($)</label>
                <input 
                  type="number" 
                  name="colacion"
                  value={formData.colacion}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-emerald-400 mb-1">Movilización ($)</label>
                <input 
                  type="number" 
                  name="movilizacion"
                  value={formData.movilizacion}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-emerald-400 mb-1">Viáticos ($)</label>
                <input 
                  type="number" 
                  name="viaticos"
                  value={formData.viaticos}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 4: Descuentos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> 4. Descuentos Legales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Seleccionar AFP</label>
                <select 
                  name="afpNombre"
                  value={formData.afpNombre}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none mb-2"
                >
                  {Object.keys(AFP_TASAS).map(afp => (
                    <option key={afp} value={afp}>{afp} ({AFP_TASAS[afp]}%)</option>
                  ))}
                  <option value="Otra">Otra (Personalizada)</option>
                </select>

                {formData.afpNombre === 'Otra' && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      name="afpCustom"
                      placeholder="Nombre AFP"
                      value={formData.afpCustom}
                      onChange={handleInputChange}
                      className="w-2/3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <input 
                      type="number" 
                      step="0.01"
                      name="afpPorcentaje"
                      placeholder="%"
                      value={formData.afpPorcentaje}
                      onChange={handleInputChange}
                      className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Institución de Salud</label>
                <select 
                  name="saludInstitucion"
                  value={formData.saludInstitucion}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none mb-2"
                >
                  <option value="Fonasa">Fonasa (7% Obligatorio)</option>
                  <option value="Isapre">Isapre (Plan Pactado en $)</option>
                </select>

                {formData.saludInstitucion === 'Isapre' && (
                  <input 
                    type="number" 
                    name="saludMontoPersonalizado"
                    placeholder="Monto plan Isapre ($)"
                    value={formData.saludMontoPersonalizado}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Resumen Final */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-indigo-300 mb-4">Resumen y Cálculo Final</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Imponible</span>
                <span className="text-lg font-bold text-slate-200">${imponible.toLocaleString('es-CL')}</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Haberes</span>
                <span className="text-lg font-bold text-slate-200">${totalHaberes.toLocaleString('es-CL')}</span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Total Descuentos</span>
                <span className="text-lg font-bold text-red-400">-${totalDescuentos.toLocaleString('es-CL')}</span>
              </div>
              <div className="bg-indigo-900/50 p-4 rounded-xl border border-indigo-500/50">
                <span className="text-xs text-indigo-200 block font-semibold">Sueldo Líquido</span>
                <span className="text-xl font-extrabold text-emerald-400">${sueldoLiquido.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 text-base"
            >
              <FileText className="h-5 w-5" />
              <span>{loading ? 'Generando Liquidación...' : 'Guardar y Generar Liquidación Oficial'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}