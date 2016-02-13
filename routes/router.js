/*global homeController,userController*/
var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  homeController.home(req, res, next);
});

router.post('/api/users/signup', function(req, res, next) {
  userController.create(req, res);
});

router.post('/api/users/signin', function(req, res, next) {
  userController.login(req, res);
});

// router.get('/auth/facebook', function(req, res, next) {
//  userController.facebookLogin(req,res);
// });

router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// router.get('/auth/facebook/callback',
//    passport.authenticate('facebook', {
//      successRedirect : '/profile',
//      failureRedirect : '/'
//    }));

router.get('/auth/facebook/callback', function(req, res, next) {
  userController.facebookLoginCallback(req, res);
});

module.exports = router;
