const express = require('express');
const devicesController = require('../controllers/devices');
const router = express.Router();

router.use('/:node/:type/:oidindex', devicesController.listNodeInterfaces);
router.use('/:node', devicesController.listNodeInterfaces);
router.use('/', devicesController.listDevices);
// router.use('/interfaces', devicesController.listInterfaces);

module.exports = router;