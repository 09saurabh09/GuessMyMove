/**
 * Created by saurabhk on 07/02/16.
 */
module.exports = {
  getGameByID: function(gameId) {
      //gameModel.
  },
  createGame: function(gameObject) {
      var newGame = new gameModel();
      newGame.playerOne = gameObject.playerOne;
      newGame.gameId = gameObject.gameId;
      newGame.save(function(err) {
          if (err)
              throw err;

          // if successful, return the new user
          console.log('game saved');
      });
    }
};