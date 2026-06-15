const express = require('express');
const router = express.Router();
const fermentationController = require('../controllers/fermentationController');

// POST /api/fermentation/control
router.post('/control', fermentationController.controlFermentation);

module.exports = router;
