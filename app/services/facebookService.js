/**
 * Created by saurabhk on 28/03/16.
 */
/* globals UserModel*/
var request = require('request');
var mongoose = require('mongoose');
var graphAPIHost = 'https://graph.facebook.com';
module.exports = {
    getAllFriends: function(token) {
        request(graphAPIHost + '/me/friends?access_token=' + token, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var friendsList = JSON.parse(body).data;
                return friendsList.map(function(friend) {return friend.id});
            }
        })
    },

    addFriends: function(token, user) {
        var friendIds = this.getAllFriends(token);

        UserModel.find()
            .where("facebook.id")
            .in(friendIds)
            .select('_id')
            .exec(function(err, records) {
                if (err) return null;
                var newFriends = records.map(function(friend) {return friend.id});
                console.log(user.friends, newFriends);
                user.friends = user.friends.concat(newFriends);
                user.save(function(err) {
                    if (err) console.log(err.message);
                });
            })
    }

};