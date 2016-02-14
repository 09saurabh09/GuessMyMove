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
    var playerOne = true;
    var beginning = true;
    var myPiece, opponentPiece;

    var socket = io(Server);

    var board = jsboard.board({ attach: "game", size: "6x6" , style: "checkerboard"});
    var x = jsboard.piece({ text: "X", fontSize: "30px", textAlign: "center" });
    var o = jsboard.piece({ text: "O", fontSize: "30px", textAlign: "center"});
    var guessPiece = jsboard.piece({ text: "?", fontSize: "20px", textAlign: "center"});

    var turn = true;
    var guess = true;
    board.style({ borderSpacing: "0px" });
    board.cell("each").style({
        width: "50px",
        height: "50px",
        margin: '5px',
        borderRadius: "2px"
    });


    board.cell("each").on("click", function() {
        //console.log(board.cell(this));
        //console.log(board.cell(this).where());
        //console.log(board.cell(1,2));
        //board.cell([4,2]).place(o.clone());
        if (board.cell(this).get()===null) {
            if (gameStarted) {
                // Emit a event for this turn
                if (beginning && playerOne) {
                    turn = !turn;
                }
                myPiece = playerOne ? x : o;
                opponentPiece = !playerOne ? x : o;
                if ((beginning && playerOne) || (!beginning)) {
                    if (turn) {
                        board.cell(this).place(myPiece.clone());
                        turn = !turn;
                        socket.emit('newTurn', {gameId: playingGameId, location: board.cell(this).where(), userId: secretKey});
                    } else if (guess) {
                        board.cell(this).place(guessPiece.clone());
                        guess = !guess;
                        socket.emit('turnTransfer', {gameId: playingGameId, userId: secretKey});
                    }
                    beginning = false;
                }


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

    socket.on('gameJoined', function () {
        board.cell("each").rid();
        gameStarted = true;
    });

    socket.on('opponentTurn', function(data) {
        console.log(data);
        board.cell(data).place(opponentPiece.clone());

    });

    socket.on('takeTurn', function() {
        turn = true;
        guess = true;
        console.log("myTurn");
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
                    $('#friendGameID').prop('disabled', false);
                    board.cell("each").rid();
                    playingGameId = newGameId;
                    gameStarted = true;
                    playerOne = false;
                    beginning = false

                    // Inform other player about success
                    socket.emit('newGameJoined', { gameId: newGameId, userId: secretKey});
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