/**
 * Created by saurabhk on 26/01/16.
 */
$(function() {
    var gameIdLength = 5;
    var auth = $("#loggedIn").html();
    var secretKey = null;
    var Server = 'http://localhost:8000';
    var gameId = Math.random().toString(36).substring(2, 2 + gameIdLength); // Have to increase it later
    var playingGameId = gameId;
    var gameStarted = false;

    var socket = io(Server);

    var board = jsboard.board({ attach: "game", size: "6x6" , style: "checkerboard"});
    var x = jsboard.piece({ text: "X", fontSize: "30px", textAlign: "center" });
    var o = jsboard.piece({ text: "O", fontSize: "30px", textAlign: "center"});

    var turn = true;
    board.style({ borderSpacing: "0px" });
    board.cell("each").style({
        width: "50px",
        height: "50px",
        margin: '5px',
        borderRadius: "2px"
    });


    board.cell("each").on("click", function() {
        console.log(board.cell(this));
        console.log(board.cell(this).where());
        console.log(board.cell(1,2));
        board.cell([4,2]).place(o.clone());
        if (board.cell(this).get()===null) {
            if (turn) { board.cell(this).place(x.clone()); }
            else      { board.cell(this).place(o.clone()); }
            turn = !turn;

            if (gameStarted) {
                // Emit a event for this turn
                socket.emit('newTurn', {gameId: playingGameId, location: board.cell(this).where(), userId: secretKey});
            }
        }
    });

    // Set temporary user id
    if (auth !== 'true')  {
        secretKey = $.jStorage.get('secretKey', null);
        if (!secretKey) {
            secretKey = Math.random().toString(36).substring(2, 10);
            $.jStorage.set('secretKey', secretKey)
        }
    }

    // Event Listners
    socket.on('connect', function() {
        socket.emit('registerUser', { userId:secretKey });
        console.log('connected');
    });
    socket.on('disconnect', function () {
        console.log('disconnected')
    });

    // Register this game
    socket.emit('newGame', { id: gameId, secretKey:secretKey });

    socket.on('opponentTurn', function(data) {
        console.log(data);
    });

    $('div#gameId')[0].innerHTML = gameId;
    $('#friendGameID').on("keyup paste", function(event) {
        var newGameId = event.target.value.trim();
        var data;
        if (newGameId.length === gameIdLength) {
            $('#friendGameID').prop('disabled', true);
            data = { ownGameId: gameId, requestGameId:newGameId, userId: secretKey };
            $.ajax({
                type: "POST",
                url: Server+'/api/game/gameRequest',
                data: data,
                success: function(response) {
                    console.log(response);
                    $('#friendGameID').prop('disabled', false);
                    board.cell("each").rid();
                    playingGameId = newGameId;
                    gameStarted = true;
                },
                error : function () {
                    $('#friendGameID').prop('disabled', false);
                }
            });
            //socket.emit('acceptGame', { ownGameId: gameId, requestGameId:newGameId });
            // Raise a toast and search for game in server

        }

    });

});