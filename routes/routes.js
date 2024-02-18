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
router.get('/logout', controller.logoutRoute);
router.get('/emotionChart', controller.getEmotionChart);
router.get('/loginOut', controller.getLoginFromLogoutRoute);
router.get('/view', controller.getViewRoute);
router.post('/filterByDate', controller.emotionForUserbyDate);
router.get('/account', controller.getAccountRoute);
router.get('/passwordChange', controller.getPasswordChangeRoute);
router.post('/changePassword', controller.putPasswordChange);
router.post('/deleteEmotions', controller.deleteEmotions);
router.get('/deleteEmotions', controller.getDeleteEmotionsRoute);
router.get('/wipeout', controller.getWipeout);
router.post('/deleteAll', controller.deleteAll);

module.exports = router;