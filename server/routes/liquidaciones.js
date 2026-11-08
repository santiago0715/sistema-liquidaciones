const router = require('express').Router();
const Liquidacion = require('../models/Liquidacion');

// Crear nueva liquidación
router.post('/crear', async (req, res) => {
  try {
    const nuevaLiquidacion = new Liquidacion(req.body);
    await nuevaLiquidacion.save();
    res.status(201).json({ message: 'Liquidación creada con éxito', liquidacion: nuevaLiquidacion });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear la liquidación', error: err.message });
  }
});

// Obtener historial de liquidaciones (ruta única)
router.get('/', async (req, res) => {
  try {
    const liquidaciones = await Liquidacion.find().sort({ fechaCreacion: -1 });
    res.json(liquidaciones);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el historial', error: err.message });
  }
});

// Obtener una liquidación específica por su ID (¡Esta faltaba!)
router.get('/:id', async (req, res) => {
  try {
    const liquidacion = await Liquidacion.findById(req.params.id);
    if (!liquidacion) {
      return res.status(404).json({ message: 'Liquidación no encontrada' });
    }
    res.json(liquidacion);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la liquidación', error: err.message });
  }
});

// Eliminar liquidación
router.delete('/:id', async (req, res) => {
  try {
    await Liquidacion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Liquidación eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar', error: err.message });
  }
});

module.exports = router;