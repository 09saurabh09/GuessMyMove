/**
 * Created by saurabhk on 13/02/16.
 */
var redis = require("redis");
var configDB = require('./../../config/database.js');
var idToSessionHash = "idToSess";

var redisClient = redis.createClient({host: configDB.redisHost, port: configDB.redisPort});
redisClient.auth(configDB.redisPassword);

redisClient.on("connect", function () {
    console.log("Connected to Redis");
});

redisClient.on("error", function (err) {
    console.log("Error connecting to redis" + err);
});

module.exports =  {

   setSessionID : function (key, value) {
       redisClient.hset(idToSessionHash,key, value);
       console.log("new "+ idToSessionHash+ " mapping created");
   },
   getSessionId : function (key, callback) {
       redisClient.hget(idToSessionHash,key, function(err, data) {
           if (err) {
               console.log("Redis Error in retrieving data for hash " +idToSessionHash+ "for key " + key+ "error: " +err.message )
               callback(err);
           } else {
               callback(null, data);
           }
       });
   }
};