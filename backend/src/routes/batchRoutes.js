const { Router } = require('express');
const {
  getReadings,
  getGraphs,
  getSummary,
  updateGlp,
  updatePrice,
} = require('../controllers/batchController');

const router = Router();

router.get('/:batchId/readings', getReadings);
router.get('/:batchId/graphs', getGraphs);
router.get('/:batchId/summary', getSummary);
router.put('/:batchId/glp', updateGlp);
router.put('/:batchId/price', updatePrice);

// Dummy create endpoint to silence 404 errors during local demo mode
router.post('/', (req, res) => res.status(201).json({ success: true, message: 'Mock batch created' }));

module.exports = router;
