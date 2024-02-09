const express = require('express');
const controller = require('./../controllers/controllers');
const router = express.Router();



router.get('/', controller.getDefaultRoute);
router.get('/login', controller.getLoginRoute);

module.exports = router;