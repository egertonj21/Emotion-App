const express = require('express');
const controller = require('./../controllers/controllers');
const router = express.Router();



router.get('/', controller.getDefaultRoute);
router.get('/login', controller.getLoginRoute);
router.post('/login', controller.postLoginRoute);
router.get('/logEmotion', controller.getLogEmotionRoute);
router.post('/logEmotion', controller.postEmotionRoute);

module.exports = router;