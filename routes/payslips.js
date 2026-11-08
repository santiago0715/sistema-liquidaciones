const router = require('express').Router();
const Payslip = require('../models/Payslip');

// 1. CREAR UNA NUEVA LIQUIDACIÓN
router.post('/', async (req, res) => {
  try {
    const { userId, periodo, empresa, trabajador, haberes, descuentos, totales, observaciones } = req.body;

    const newPayslip = new Payslip({
      userId,
      periodo,
      empresa,
      trabajador,
      haberes,
      descuentos,
      totales,
      observaciones
    });

    const savedPayslip = await newPayslip.save();
    res.status(201).json({ message: '¡Liquidación guardada exitosamente!', payslip: savedPayslip });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la liquidación', error: error.message });
  }
});

// 2. OBTENER TODAS LAS LIQUIDACIONES DE UN USUARIO ESPECÍFICO
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const payslips = await Payslip.find({ userId }).sort({ createdAt: -1 });
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las liquidaciones', error: error.message });
  }
});

// 3. OBTENER UNA LIQUIDACIÓN POR SU ID
router.get('/:id', async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) {
      return res.status(404).json({ message: 'Liquidación no encontrada' });
    }
    res.json(payslip);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar la liquidación', error: error.message });
  }
});

module.exports = router;