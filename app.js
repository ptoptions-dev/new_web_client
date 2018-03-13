'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var app = express();

// Bootstrap application settings
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


app.get('/getserverport', function(req, res){
    res.json({port: process.env.server_port});
});

module.exports = app;
