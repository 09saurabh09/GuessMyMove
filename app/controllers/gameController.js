/**
 * Created by saurabhk on 07/02/16.
 */
/* globals redisController, GameModel*/
module.exports = {
    getGameByID: function(gameId, callback) {
        console.log(gameId);
        GameModel.findOne({
            'gameId': gameId
        }, function(err, game) {
            if (err) {
                console.log('ERROR::: in finding game ' + gameId + ' error: ' + err.message);
                callback(err.message);
            } else if (game) {
                callback(null, game);
            } else {
                console.log('ERROR ::: Game does not exist');
                callback('game not found');
            }
        });
    },
    createGame: function(gameObject) {
        var newGame = new GameModel(gameObject);
        newGame.save(function(err) {
            if (err) {
                console.log(err.message);
            } else {
            // if successful, return the new user
                console.log('game saved');
            }
        });
    },

    acceptRequest: function(req, res) {
        var currentUserId, gameId, playerMapping, userEmail;
        if (req.user) {
            currentUserId = req.user.id;
            userEmail = req.user.local.email;
        } else {
            currentUserId = req.body.userId;
        }
        gameId = req.body.requestGameId;

        this.getGameByID(gameId, function(err, game) {
            if (err) {
                res.send('Game does not exist');
            } else {
                game.playerTwoId = currentUserId;
                if (userEmail) {
                    game.playerTwoEmail = userEmail;
                }
                game.save(function(err) {
                    if (err) {
                        console.log('can not update game');
                        res.send('Try Again');
                    } else {
                        res.send('Game joined');
                    }
                });

                //  Create mapping of game and players in redis
                playerMapping = {};
                playerMapping[game.playerOneId] = game.playerTwoId;
                playerMapping[game.playerTwoId] = game.playerOneId;
                redisController.setKey(gameId, JSON.stringify(playerMapping));
            }
        });
    }
};