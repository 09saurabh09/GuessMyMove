/**
 * Created by saurabhk on 28/03/16.
 */
/* globals UserModel*/
var request = require('request');
var graphAPIHost = 'https://graph.facebook.com';

module.exports = {
    getAllFriends: function(token, callback) {
        request(graphAPIHost + '/me/friends?access_token=' + token, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var friendsList = JSON.parse(body).data;
                callback(friendsList.map(function(friend) {return friend.id}));
            }
        })
    },

    addFriends: function(token, user) {
        this.getAllFriends(token, function(friendIds) {
            UserModel.find()
                .where("facebook.id")
                .in(friendIds)
                .select('_id')
                .exec(function(err, records) {
                    if (err) return null;
                    var newFriends = records.map(function(friend) {return friend.id});
                    user.friends = newFriends;

                    user.save(function(err) {
                        if (err) console.log(err.message);
                        console.log("Success ::: Friends added for user: "+user.local.email);
                    });
                })
        });

    }

};