const express = require('express');
const router = express.Router();
const runPythonControllers = require('../controllers/runPythonControllers');

// API สำหรับรัน Python script
router.post('/runpython', runPythonControllers.runPythonScript);

// API สำหรับหยุด Python script
router.post('/stoppython', runPythonControllers.stopPythonScript);

module.exports = router;
