/**
 * Created by saurabhk on 26/01/16.
 */
$(function() {
    // Help content for players
    var helpEnabled = $.jStorage.get('helpEnabled', true);
    if (helpEnabled) {
        $('#helpModel').modal('show');
    }

    var gameIdLength = 5;
    var auth = $("#loggedIn").html();
    var secretKey = null;
    var gameId = Math.random().toString(36).substring(2, 2 + gameIdLength).toLowerCase(); // Have to increase it later
    var playingGameId = gameId;
    var gameStarted = false;
    var playerOne = true;
    var beginning = true;
    var myPiece, opponentPiece, myGuess, opponentGuess;
    var score = 0;
    var opponentScore = 0;
    var nTurnInGame = 5;
    var turnCount = 0;
    var socket = io();

    var board = jsboard.board({ attach: "game", size: "6x6" , style: "checkerboard"});
    var x = jsboard.piece({ text: "X", fontSize: "30px", textAlign: "center" });
    var o = jsboard.piece({ text: "O", fontSize: "30px", textAlign: "center"});
    var guessPiece = jsboard.piece({ text: "?", fontSize: "20px", textAlign: "center"});
    var mixPiecePlayerOne = jsboard.piece({ text: "?O", fontSize: "20px", textAlign: "center"});
    var mixPiecePlayerTwe = jsboard.piece({ text: "?X", fontSize: "20px", textAlign: "center"});

    var turn = true;
    var guess = true;
    board.style({ borderSpacing: "0px" });
    board.cell("each").style({
        width: "50px",
        height: "50px",
        margin: '5px',
        borderRadius: "2px"
    });

    setPosition();

    $('#winnerModel').on('hidden.bs.modal', function (e) {
       //Start new game
        startNewGame();
    });

    $('#disableHelp').on('click', function () {
        //Disable it and update setting if logged in
        if (auth === 'true') {
            //Post call to update settings
        } else {
            $.jStorage.set('helpEnabled', false);
        }
    });

    board.cell("each").on("click", function() {
        var points;
        if (board.cell(this).get()===null) {
            if (gameStarted) {
                // Emit a event for this turn
                if (beginning && playerOne) {
                    turn = !turn;
                }
                myPiece = playerOne ? x : o;
                opponentPiece = !playerOne ? x : o;

                myGuess = board.cell(this).where();
                if ((beginning && playerOne) || (!beginning)) {
                    if (turn) {
                        board.cell("each").rid();
                        board.cell(this).place(myPiece.clone());
                        board.cell(opponentGuess).place(guessPiece.clone());
                        points = computePoints(myGuess, opponentGuess);
                        toastr.info(points+ " points to you, now make your guess");
                        score = score + points;
                        $('div#myScore')[0].innerHTML = score;
                        turn = !turn;

                        // Player one will decide when to finish the game, will send an event when game will finish
                        turnCount = turnCount + 1;
                        if (playerOne && (turnCount === nTurnInGame)) {
                            declareWinner();
                            updateWinner();
                            socket.emit('newTurn', {gameId: playingGameId, location: myGuess, userId: secretKey, gameOver: true});
                        } else {
                            socket.emit('newTurn', {gameId: playingGameId, location: myGuess, userId: secretKey});
                        }

                    } else if (guess) {
                        board.cell("each").rid();
                        board.cell(this).place(guessPiece.clone());
                        guess = !guess;
                        toastr.info("Great!!!, now wait for opponent move and guess");
                        socket.emit('turnTransfer', {gameId: playingGameId, location: myGuess, userId: secretKey});
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
        if (playerOne) {
            toastr.info("Your turn, make your guess");
        }
    });

    socket.on('opponentTurn', function(opponentTurn) {
        board.cell(opponentTurn.location).place(opponentPiece.clone());

        //Update opponent's score
        var points = computePoints(myGuess, opponentTurn.location);
        toastr.info(points+ " points to your opponent");
        opponentScore = opponentScore + points;
        $('div#opponentScore')[0].innerHTML = opponentScore;

        if (opponentTurn.gameOver) {
            declareWinner();
        }

    });

    socket.on('takeTurn', function(oppGuess) {
        turn = true;
        guess = true;
        beginning = false;
        opponentGuess = oppGuess;
        toastr.info("Your turn, make your move close to opponent guess");
    });

    $('div#gameId')[0].innerHTML = gameId;
    $('#friendGameID').on("keyup paste", function(event) {
        var newGameId = event.target.value.trim();
        var data;
        if (newGameId.length === gameIdLength) {
            $('#friendGameID').prop('disabled', true);
            data = { ownGameId: gameId.toLowerCase(), requestGameId:newGameId.toLowerCase(), userId: secretKey };
            $.ajax({
                type: "POST",
                url: '/api/game/gameRequest',
                data: data,
                success: function(response) {
                    $('#friendGameID').prop('disabled', false);
                    board.cell("each").rid();
                    playingGameId = newGameId;
                    gameStarted = true;
                    playerOne = false;

                    // Inform other player about success
                    socket.emit('newGameJoined', { gameId: newGameId, userId: secretKey});
                    toastr.info("Opponent turn, wait for guess");
                },
                error : function () {
                    $('#friendGameID').prop('disabled', false);
                }
            });
            //socket.emit('acceptGame', { ownGameId: gameId, requestGameId:newGameId });
            // Raise a toast and search for game in server

        }

    });

    function computePoints(a,b) {
        return 10 -  (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]));
    }

    function setPosition() {
        var gameDiv = $('#game');
        var scoreDiv = $('#scoreDiv');
        var scoreLeft = gameDiv.offset().left + gameDiv.width() - 80;
        $('#friendGameID').width(gameDiv.width());
        scoreDiv.css({position: "absolute",left : scoreLeft, display: "inline"});
        //scoreDiv.css('display','inline');
    }

    function declareWinner() {
        if(score > opponentScore) {
            $('div#winnerMessage')[0].innerHTML = 'Congratulations!!! You have won the match';
        } else if (score < opponentScore) {
            $('div#winnerMessage')[0].innerHTML = 'You Lost!!! Better luck next time';
        } else {
            $('div#winnerMessage')[0].innerHTML = 'Its a tie, Play one more game to decide who is champion';
        }
        $('div#myScoreDialog')[0].innerHTML = score;
        $('div#opponentScoreDialog')[0].innerHTML = opponentScore;
        $('#winnerModel').modal('show');

        //New game will be created after this

    }

    function startNewGame() {
        //board.cell("each").rid();
        //$('div#myScore')[0].innerHTML = 0;
        //$('div#opponentScore')[0].innerHTML = 0;
        //score = 0;
        //opponentScore = 0
        window.location="/"
    }

    function updateWinner() {
        var data = {};
        data.gameId = gameId;
        data.playerOneWinner = (score > opponentScore);
        data.tie = (score === opponentScore);
        $.ajax({
            type: "POST",
            url: '/api/game/updateWinner',
            data: data,
            success: function(response) {
                console.log(response)
            },
            error : function () {
                console.log('winner not updated')
            }
        });
    }
});