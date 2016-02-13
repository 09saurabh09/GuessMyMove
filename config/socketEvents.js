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
                        playerOne : user.local.email,
                        isTemporary : false
                    });

                    // Have to use async later
                    gameController.createGame(gameObject);


                });
            } else {
                lodash.assign(gameObject, {
                    playerOne : data.secretKey,
                    isTemporary : true
                });

                // Have to use async later
                // Create a mapping of unique id and session id
                redisController.setSessionID(gameObject.playerOne, socket.id);
                gameController.createGame(gameObject);

            }


        });

    });


};