/**
 * Created by saurabhk on 07/02/16.
 */
var mongoose = require('mongoose');
var gameSchema = mongoose.Schema({
    playerOne : String,
    playerTwo : String,
    gameId : { type : String , unique : true, required : true, index: true },
    state : String,
    winner : String
}, { timestamps: true });

gameSchema.pre("save",function(next, done) {
    var self = this;
    gameModel.findOne({gameId : self.gameId},function(err, user) {
        if(err) {
            done(err);
        } else if(user) {
            self.invalidate("gameId","gameId must be unique");
            done(new Error("gameId must be unique"));
        } else {
            done();
        }
    });
    next();
});

module.exports = mongoose.model('game', gameSchema);