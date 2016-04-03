/**
 * Created by saurabhk on 07/02/16.
 */
/*globals gameController,redisController, UserModel*/

var lodash = require('lodash');

module.exports = function (io) {
    global['globalIO'] = io;
    function customError(socketId, errorCode) {
        //Need to define error codes for appropriate action on frontend
        io.sockets.connected[socketId].emit('errorEvent', 0);
    };

    io.on('connection', function (socket) {
        try {
            if (socket.request.session && socket.request.session.passport) {
                redisController.setSessionID(socket.request.session.passport.user, socket.id);
                UserModel.findById(socket.request.session.passport.user, function (err, user) {
                    if (err) {
                        console.log("ERROR ::: Unable to find user, error " + err.message);
                    } else {
                        user.isOnline = true;
                        user.save(function (err) {
                            if (err)
                                console.log("ERROR ::: Can not find user, error:" + err.message);
                        })
                    }
                });
            }
        } catch (e) {
            console.log("ERROR ::: Can not make user online error: " + e.message);
        }

        socket.on('disconnect', function () {
            try {
                if (socket.request.session.passport) {
                    UserModel.findById(socket.request.session.passport.user, function (err, user) {
                        if (err) {
                            console.log("ERROR ::: Unable to find user, error " + err.message);
                        } else {
                            user.isOnline = false;
                            user.save(function (err) {
                                if (err)
                                    console.log("ERROR ::: Can not find user, error:" + err.message);
                            })
                        }
                    });
                }
            } catch (e) {
                console.log("ERROR ::: Can not make user online error: " + e.message);
            }

        });

        socket.on('registerUser', function (data) {
            if (socket.request.session.passport) {
                //redisController.setSessionID(socket.request.session.passport.user, socket.id);
            } else {
                redisController.setSessionID(data.userId, socket.id);
            }
        });

        socket.on('newGame', function (data) {
            try {
                var gameObject = {
                    gameId: data.id
                };
                // Create game
                if (socket.request.session.passport) {
                    var userId = socket.request.session.passport.user;

                    console.log('creating game');
                    UserModel.findById(userId, function (err, user) {
                        if (err) {
                            console.log('ERROR ::: Unable to find user');
                        } else if (user) {
                            lodash.assign(gameObject, {
                                playerOneEmail: user.local.email,
                                playerOneId: user.id,
                                isTemporary: false
                            });
                        } else {
                            lodash.assign(gameObject, {
                                playerOneId: data.secretKey
                            });
                        }

                        // Have to use async later
                        // Create a mapping of unique id and session id
                        redisController.setSessionID(gameObject.playerOneId, socket.id);
                        gameController.createGame(gameObject);
                    });
                } else {
                    lodash.assign(gameObject, {
                        playerOneId: data.secretKey,
                        isTemporary: true
                    });

                    // Have to use async later
                    // Create a mapping of unique id and session id
                    redisController.setSessionID(gameObject.playerOneId, socket.id);
                    gameController.createGame(gameObject);
                }
            } catch (e) {
                console.log('ERROR::: Unable to create game, error: ' + e.message);
                customError(socket.id, 0);
            }
        });

        socket.on('newTurn', function (data) {
            var userId, opponent;
            console.log(data);
            if (socket.request.session.passport) {
                userId = socket.request.session.passport.user;
            } else {
                userId = data.userId;
            }
            var dataToSend = {
                location: data.location,
                gameOver: data.gameOver
            };
            redisController.getKey(data.gameId, function (err, game) {
                opponent = JSON.parse(game)[userId];
                redisController.getSocketId(opponent, function (err, socketId) {
                    if (io.sockets.connected[socketId]) {
                        console.log(data);
                        io.sockets.connected[socketId].emit('opponentTurn', dataToSend);
                    }
                });
            });
        });

        socket.on('newGameJoined', function (data) {
            try {
                var userId, opponent;
                console.log(data);
                if (socket.request.session.passport) {
                    userId = socket.request.session.passport.user;
                } else {
                    userId = data.userId;
                }
                redisController.getKey(data.gameId, function (err, game) {
                    opponent = JSON.parse(game)[userId];
                    redisController.getSocketId(opponent, function (err, socketId) {
                        if (io.sockets.connected[socketId]) {
                            io.sockets.connected[socketId].emit('gameJoined');
                        }
                    });
                });
            } catch (e) {
                console.log('ERROR::: Unable to join game, error: ' + e.message);
                customError(socket.id, 0);
            }
        });

        socket.on('turnTransfer', function (data) {
            var userId, opponent;
            console.log(data);
            if (socket.request.session.passport) {
                userId = socket.request.session.passport.user;
            } else {
                userId = data.userId;
            }
            redisController.getKey(data.gameId, function (err, game) {
                opponent = JSON.parse(game)[userId];
                redisController.getSocketId(opponent, function (err, socketId) {
                    if (io.sockets.connected[socketId]) {
                        io.sockets.connected[socketId].emit('takeTurn', data.location);
                    }
                });
            });
        });
    });
};