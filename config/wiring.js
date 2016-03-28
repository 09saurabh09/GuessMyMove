// We will do here controller and model wiring so that we cast
//
// access them in any file without requiring them
var fs = require('fs');

var controllersPath = './app/controllers/';
var modelsPath = './app/models/';
var servicePath = './app/services/';

var controllersPathForRequire = './../app/controllers/';
var modelsPathForRequire = './../app/models/';
var servicePathForRequire = './../app/services/';

console.log(process.cwd());

fs.readdirSync(controllersPath).forEach(function(name) {
    global[name.split('.')[0]] = require(controllersPathForRequire + name);
});

fs.readdirSync(modelsPath).forEach(function(name) {
    global[name.slice(0, 1).toUpperCase() + name.split('.')[0].slice(1)] = require(modelsPathForRequire + name);
});

fs.readdirSync(servicePath).forEach(function(name) {
    global[name.slice(0, 1).toUpperCase() + name.split('.')[0].slice(1)] = require(servicePathForRequire + name);
});