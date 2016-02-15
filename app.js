var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');

var RedisStore = require('connect-redis')(session);

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var routes = require('./routes/router');
var configDB = require('./config/database.js');


require('./config/wiring.js'); // For making models and controllers globally accessible

require('./config/passport')(passport); // pass passport for configuration
require('./config/socketEvents')(io);

// configuration ===============================================================
mongoose.connect(configDB.mongoUrl, function(err) {
    if (err) {
        console.log('Error connecting to mongo');
    } else {
        console.log('connected to MongoDB');
    }
}); // connect to our database


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var sessionMiddleware = session({
    store: new RedisStore({
        host: configDB.redisHost,
        port: configDB.redisPort,
        pass: configDB.redisPassword
    }),
    secret: 'ilovescotchscotchyscotchscotch'
});

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

server.listen(8000, function(err) {
    if (err) {
        console.log('Error in starting server');
    } else {
        console.log('Server started on port 8000');
    }
});
module.exports = app;