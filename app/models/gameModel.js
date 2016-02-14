/**
 * Created by saurabhk on 07/02/16.
 */
var mongoose = require('mongoose');
var gameSchema = mongoose.Schema({
    playerOneEmail : String,
    playerTwoEmail : String,
    playerOneId : String,
    playerTwoId : String,
    gameId : { type : String, unique: true, index: true},
    gameType: Number,
    isTemporary : Boolean,
    state : String,
    winner : String
}, { timestamps: true });

module.exports = mongoose.model('game', gameSchema);