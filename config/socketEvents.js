/**
 * Created by saurabhk on 07/02/16.
 */
module.exports = function(io) {
    io.on('connection', function(socket){
        console.log('a user connected');
        //console.log(socket.request.session );
        //console.log(io.sockets.connected);
        socket.emit('news', { hello: 'world' });

        socket.on('newGame', function(data) {
            //console.log(socket.request.session.passport.user);
            var userId = socket.request.session.passport.user;
            userModel.findById(userId, function(err, user) {
                if (err) {
                    console.log("ERROR ::: Unable to find user");
                }
                //console.log(user.local.email);
                var gameObject = {
                    playerOne : user.local.email,
                    gameId : data.id
                };
                gameController.createGame(gameObject);
            });
            //console.log(data.id);

        });

    });


};