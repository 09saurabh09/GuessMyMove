/**
 * Created by saurabhk on 26/01/16.
 */
$(function() {
    var socket = io();
    var b = jsboard.board({ attach: "game", size: "6x6" , style: "checkerboard"});
    var x = jsboard.piece({ text: "X", fontSize: "30px", textAlign: "center" });
    var o = jsboard.piece({ text: "O", fontSize: "30px", textAlign: "center"});

    var turn = true;
    b.style({ borderSpacing: "5px" });
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


});