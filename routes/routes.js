const express = require('express');
const controller = require('./../controllers/controllers');
const router = express.Router();



router.get('/', controller.getDefaultRoute);
router.get('/login', controller.getLoginRoute);
router.post('/login', controller.postLoginRoute);
router.get('/logEmotion', controller.getLogEmotionRoute);
router.post('/logEmotions', controller.postEmotionRoute);
router.get('/emotionLog', controller.getEmotionForUser);
router.get('/editEmotion/:emotion_id', controller.getEdit);
router.get('/deleteEmotion/:emotion_id', controller.getDelete);
router.post('/putTriggers', controller.putTriggers);
router.post('/deleteEmotion', controller.deleteDelete);
router.get('/register', controller.getRegisterRoute);
router.post('/register', controller.postRegisterRoute);

module.exports = router;