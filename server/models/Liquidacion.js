const mongoose = require('mongoose');

const liquidacionSchema = new mongoose.Schema({
  empresaRazonSocial: { type: String, required: true },
  empresaRut: { type: String, required: true },
  empresaLogo: { type: String }, // <--- NUEVO: Campo opcional para el logo
  trabajadorNombre: { type: String, required: true },
  trabajadorRut: { type: String, required: true },
  periodo: { type: String, required: true },
  diasTrabajados: { type: Number, required: true },
  sueldoBase: { type: Number, required: true },
  horasExtrasMonto: { type: Number, default: 0 },
  diasFaltadosMonto: { type: Number, default: 0 },
  responsabilidadCaja: { type: Number, default: 0 },
  bonosDinamicos: [{ nombre: String, monto: Number }],
  colacion: { type: Number, default: 0 },
  movilizacion: { type: Number, default: 0 },
  viaticos: { type: Number, default: 0 },
  totalImponible: { type: Number, required: true },
  totalNoImponible: { type: Number, required: true },
  totalHaberes: { type: Number, required: true },
  afpNombre: { type: String, required: true },
  afpPorcentaje: { type: Number, required: true },
  afpMonto: { type: Number, required: true },
  saludInstitucion: { type: String, required: true },
  saludPorcentaje: { type: Number, required: true },
  saludMonto: { type: Number, required: true },
  seguroCesantia: { type: Number, required: true },
  totalDescuentos: { type: Number, required: true },
  sueldoLiquido: { type: Number, required: true },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Liquidacion', liquidacionSchema);