/*globals homeController,userController,gameController*/
var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    homeController.home(req, res, next);
});

router.post('/api/users/signup', function(req, res, next) {
    userController.create(req, res);
});

router.post('/api/users/signin', function(req, res, next) {
    userController.login(req, res);
});

router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email','user_friends']
}));

router.get('/auth/facebook/callback', function(req, res, next) {
    userController.facebookLoginCallback(req, res);
});

router.post('/api/game/gameRequest', function(req, res, next) {
    gameController.acceptRequest(req, res);
});

router.post('/api/game/gameInvite', function(req, res, next) {
    gameController.gameInvite(req, res);
});

router.post('/api/game/updateWinner',isLoggedIn, function(req, res, next) {
    gameController.updateWinner(req, res);
});

router.get('/api/users/configCall', function(req, res, next) {
    userController.configParams(req, res);
});

router.get('/api/users/getOnlineFriendsList',isLoggedIn, function(req, res, next) {
    userController.getOnlineFriendsList(req, res);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    } else {
        // if they aren't send them a message
        res.send('Access Denied');
    }

}

module.exports = router;