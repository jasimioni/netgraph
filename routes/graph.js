const express = require('express');
const graphController = require('../controllers/graph');
const router = express.Router();

router.use('/:node/:type/:oidindex', graphController.graph);

module.exports = router;