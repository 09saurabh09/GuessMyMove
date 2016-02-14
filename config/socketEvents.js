/**
 * Created by saurabhk on 07/02/16.
 */
var lodash = require("lodash");

module.exports = function(io) {
    io.on('connection', function(socket){
        console.log('a user connected');
        //console.log(socket.request.session );
        //console.log(io.sockets.connected);
        socket.emit('news', { hello: 'world' });

        socket.on('registerUser', function(data) {
            if (socket.request.session.passport) {
                redisController.setSessionID(socket.request.session.passport.user, socket.id);
            } else {
                redisController.setSessionID(data.userId, socket.id);
            }
        });

        socket.on('newGame', function(data) {
            var gameObject = {gameId : data.id};
            // Create game
            if (socket.request.session.passport) {
                var userId = socket.request.session.passport.user;

                console.log("creating game");
                UserModel.findById(userId, function(err, user) {
                    if (err) {
                        console.log("ERROR ::: Unable to find user");
                    }
                    lodash.assign(gameObject, {
                        playerOneEmail : user.local.email,
                        playerOneId : user.id,
                        isTemporary : false
                    });

                    // Have to use async later
                    // Create a mapping of unique id and session id
                    redisController.setSessionID(gameObject.playerOneId, socket.id);
                    gameController.createGame(gameObject);


                });
            } else {
                lodash.assign(gameObject, {
                    playerOneId : data.secretKey,
                    isTemporary : true
                });

                // Have to use async later
                // Create a mapping of unique id and session id
                redisController.setSessionID(gameObject.playerOneId, socket.id);
                gameController.createGame(gameObject);

            }


        });

        socket.on('newTurn', function(data) {
            var userId, opponent;
            console.log(data);
            if (socket.request.session.passport) {
                userId = socket.request.session.passport.user;
            } else {
                userId = data.userId;
            }

            redisController.getKey(data.gameId, function(err, game) {
                opponent = JSON.parse(game)[userId];
                redisController.getSocketId(opponent, function(err, socketId) {
                    if (io.sockets.connected[socketId]) {
                        console.log(data);
                        io.sockets.connected[socketId].emit('opponentTurn', data.location);
                    }
                });
            });
        });

        socket.on('newGameJoined', function(data) {
            var userId, opponent;
            console.log(data);
            if (socket.request.session.passport) {
                userId = socket.request.session.passport.user;
            } else {
                userId = data.userId;
            }
            redisController.getKey(data.gameId, function(err, game) {
                opponent = JSON.parse(game)[userId];
                redisController.getSocketId(opponent, function(err, socketId) {
                    if (io.sockets.connected[socketId]) {
                        io.sockets.connected[socketId].emit('gameJoined');
                    }
                });
            });
        });

        socket.on('turnTransfer', function(data) {
            var userId, opponent;
            console.log(data);
            if (socket.request.session.passport) {
                userId = socket.request.session.passport.user;
            } else {
                userId = data.userId;
            }
            redisController.getKey(data.gameId, function(err, game) {
                opponent = JSON.parse(game)[userId];
                redisController.getSocketId(opponent, function(err, socketId) {
                    if (io.sockets.connected[socketId]) {
                        io.sockets.connected[socketId].emit('takeTurn');
                    }
                });
            });
        })

    });


};

