// config/database.js
var credentialObj = require('./credentials.json');

module.exports = {
    'mongoUrl': credentialObj.mongo.url,
    'redisHost': credentialObj.redis.host,
    'redisPort': credentialObj.redis.port,
    'redisPassword': credentialObj.redis.password
};