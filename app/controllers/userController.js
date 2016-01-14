var passport = require('passport');

module.exports = {
    create : function (req, res, next) {
      passport.authenticate('local-signup', function(err, user, info) {
          if (err) {
              console.log('ERROR ::: can not create user ::: error : '+ err.message);
          }
          else if (user){
              console.log(user, info);
              res.send('user created');
          }
          else {
              console.log(user, info);
              res.send(info);
          }

      })(req, res, next);

    },

    login : function (req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                console.log('ERROR ::: can not log in user ::: error : '+ err.message);
            }
            else if (user){
                console.log(user, info);
                res.send('user logged in');
            }
            else {
                console.log(user, info);
                res.send(info);
            }

        })(req, res, next);

    }
};