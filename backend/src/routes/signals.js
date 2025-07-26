const express = require('express');
const router = express.Router();
const { 
  getAllSignals, 
  getSignalById, 
  createManualSignal, 
  updateSignal, 
  deleteSignal 
} = require('../controllers/signalController');
const { validateSignal } = require('../middleware/validation');

// GET /api/signals - Alle signalen ophalen
router.get('/', getAllSignals);

// GET /api/signals/:id - Specifiek signaal ophalen
router.get('/:id', getSignalById);

// POST /api/signals - Handmatig signaal aanmaken
router.post('/', validateSignal, createManualSignal);

// PUT /api/signals/:id - Signaal updaten
router.put('/:id', validateSignal, updateSignal);

// DELETE /api/signals/:id - Signaal verwijderen
router.delete('/:id', deleteSignal);

module.exports = router; 