/**
 * Created by saurabhk on 26/01/16.
 */
$(function() {
    var socket = io();
    var gameIdLength = 5;

    var b = jsboard.board({ attach: "game", size: "6x6" , style: "checkerboard"});
    var x = jsboard.piece({ text: "X", fontSize: "30px", textAlign: "center" });
    var o = jsboard.piece({ text: "O", fontSize: "30px", textAlign: "center"});

    var turn = true;
    b.style({ borderSpacing: "0px" });
    b.cell("each").style({
        width: "50px",
        height: "50px",
        margin: '5px',
        borderRadius: "2px"
    });


    b.cell("each").on("click", function() {
        console.log(b.cell(this));
        console.log(b.cell(this).where());
        console.log(b.cell(1,2));
        b.cell([4,2]).place(o.clone());
        if (b.cell(this).get()===null) {
            if (turn) { b.cell(this).place(x.clone()); }
            else      { b.cell(this).place(o.clone()); }
            turn = !turn;
        }
    });

    // Event Listners
    var gameId = Math.random().toString(36).substring(2, 2 + gameIdLength); // Have to increase it later

    // Register this game
    socket.emit('newGame', { id: gameId });

    $('div#gameId')[0].innerHTML = gameId;
    $('#friendGameID').on("change keyup", function(event) {
        var newGameId = event.target.value;
        if (newGameId.length === gameIdLength) {
            $('#friendGameID').prop('disabled', true);
            // Raise a toast and search for game in server

        }

    })


});