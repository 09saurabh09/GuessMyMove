// config/database.js

module.exports = {
    'mongoUrl': process.env.MONGO_URL,
    'redisHost': process.env.REDIS_HOST,
    'redisPort': process.env.REDIS_PORT,
    'redisPassword': process.env.REDIS_PASSWORD
};