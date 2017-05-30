var express = require('express');
var app = express();
var session = require('express-session');

// Socket requires
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var path = require('path');
var request = require('request'); // simple API requests
var rp = require('request-promise'); // request promise thingy
var querystring = require('querystring');
require('dotenv').config(); //secret stuff

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = 'http://localhost:8888/callback'; // For local testing !!

app.set('view engine' , 'ejs')
    .set('views' , path.join(__dirname, 'views'))
    .use(express.static('static'))
    .use(session({
        secret: 'superGeheim',
        resave: false,
        saveUninitialized: true
    }));

var apiResponse;
var acccessToken;

io.on('connect', onConnect);

app.get('/', index);
app.get('/login', login);
app.get('/callback', callback);
app.get('/games', getGames);

function index (req , res) {
  if (acccessToken) {
    res.redirect('games');
  } else {
    res.render('index');
  }
}

function login (req, res) {
  res.redirect('https://www.leaguevine.com/oauth2/authorize/?' +
    'client_id=' + client_id +
    '&response_type=code' +
    '&redirect_uri=' + redirect_uri +
    '&scope=universal');
}

function callback (req, res) {
  var code = req.query.code;

  rp('https://www.leaguevine.com/oauth2/token/' +
    '?client_id=' + client_id +
    '&client_secret=' + client_secret +
    '&code='+ code +
    '&grant_type=authorization_code' +
    '&redirect_uri=' + redirect_uri)
      .then(function (body) {
        apiResponse = JSON.parse(body);
        acccessToken = apiResponse.access_token;

        res.redirect('/games');
    });
}

function getGames (req, res) {
  rp('http://api.playwithlv.com/v1/tournaments/20059/teams/?access_token=' + acccessToken)
      .then(function (body) {
        var data = JSON.parse(body);
        console.log(data);

        res.render('games', {
          tournamentName: data.name
        });
    });
}

// SOCKET THINGIESS HERE
function onConnect (socket) {

}

var port = process.env.PORT || 8888;

http.listen(port, function (){
    console.log('server is running: on: ' + port);
});
