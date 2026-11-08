const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Dueño de la liquidación
  periodo: { type: String, required: true }, // Ej: "Enero 2026"
  
  // Datos de la Empresa emisora
  empresa: {
    razonSocial: String,
    rutEmpresa: String,
    direccion: String
  },

  // Datos del Trabajador
  trabajador: {
    nro: Number,
    rutTrabajador: { type: String, required: true },
    nombreCompleto: { type: String, required: true },
    fechaContrato: Date,
    fechaTerminoContrato: String,
    diasTrabajados: { type: Number, default: 30 },
    vacacionesLegales: String,
    cargasFamiliares: { type: Number, default: 0 }
  },

  // Haberes (Ingresos)
  haberes: {
    sueldoBase: { type: Number, required: true },
    horasExtras: { type: Number, default: 0 },
    horasDescuento: { type: Number, default: 0 },
    otrosBonosImponibles: { type: Number, default: 0 },
    bonosNoImponibles: { type: Number, default: 0 } // Colación, Movilización
  },

  // Descuentos y Previsión
  descuentos: {
    afpNombre: String, // Habitat, PlanVital, Modelo, etc.
    afpPorcentaje: Number,
    saludInstitucion: String, // Fonasa o Isapre
    cotizacionPactadaUF: { type: Number, default: 0 },
    ahorroAfp: { type: Number, default: 0 },
    apv: { type: Number, default: 0 },
    prestamoEmpresa: { type: Number, default: 0 },
    otrosDescuentos: { type: Number, default: 0 },
    anticipos: { type: Number, default: 0 }
  },

  // Totales Calculados
  totales: {
    totalHaberes: Number,
    totalDescuentos: Number,
    liquidoAPagar: Number
  },

  observaciones: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payslip', payslipSchema);