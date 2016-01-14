var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  res.send('HomePage')

});

router.post('/api/users/signup', function(req, res, next) {
  userController.create(req,res);

});

router.post('/api/users/signin', function(req, res, next) {
  userController.login(req,res);

});

module.exports = router;
