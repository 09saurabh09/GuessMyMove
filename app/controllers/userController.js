var passport = require('passport');

module.exports = {
    create: function(req, res, next) {
        passport.authenticate('local-signup', function(err, user, info) {
            if (err) {
                console.log('ERROR ::: can not create user ::: error : ' + err.message);
            } else if (user) {
                console.log(user, info);
                res.send('user created');
            } else {
                console.log(user, info);
                res.send(info);
            }
        })(req, res, next);
    },

    login: function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) {
                console.log('ERROR ::: can not log in user ::: error : ' + err.message);
            } else if (user) {
                console.log(user, info);
                res.send('user logged in');
            } else {
                console.log(user, info);
                res.send(info);
            }
        })(req, res, next);
    },

    facebookLoginCallback: function(req, res, next) {
        passport.authenticate('facebook', function(err, user) {
            if (err) {
                console.log('ERROR ::: can not log in user ::: error : ' + err.message);
            } else if (user) {
                console.log('Success ::: FB login/Signup successful for : ' + user.facebook.email);
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    //Action will be base on device
                    return res.redirect('/');
                });
            } else {
                console.log('Facebook login Something goes wrong ::: can not log in user');
                res.send('Please try again');
            }
        })(req, res, next);
    },

    configParams: function(req,res) {
        var configObject = {loggedIn: false};
        if (req.isAuthenticated()) {
            configObject['loggedIn'] = true;
            res.send(configObject);
        } else {
            res.send(configObject);
        }
    }
};