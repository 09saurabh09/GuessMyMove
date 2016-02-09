/**
 * Created by saurabhk on 07/02/16.
 */
var mongoose = require('mongoose');
var gameSchema = mongoose.Schema({
    playerOne : String,
    playerTwo : String,
    gameId : { type : String, unique: true, index: true},
    state : String,
    winner : String
}, { timestamps: true });

module.exports = mongoose.model('game', gameSchema);