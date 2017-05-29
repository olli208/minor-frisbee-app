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
var dotenv = require('dotenv').config(); //secret stuff
var diff = require('deep-diff').diff; // compare objects

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

io.on('connect', onConnect);

app.get('/', index);
app.get('/login', login);
app.get('/callback', callback);

function index(req , res) {
  res.render('index');
}

function login(req, res){
  res.redirect('https://www.leaguevine.com/oauth2/authorize/?' +
    'client_id=' + client_id +
    '&response_type=code' +
    '&redirect_uri=' + redirect_uri +
    '&scope=universal');
}

function callback(req, res) {
  console.log(req.query.code);
  var code = req.query.code;

  // request('https://www.leaguevine.com/oauth2/token/?client_id=' + client_id + '&client_secret=' + client_secret + '&code='+ code + '&grant_type=authorization_code' + '&redirect_uri=' + redirect_uri)
  //   .then(function(body) {
  //     console.log(body)
  //     console.log('great success');
  //   });

  request.post('https://www.leaguevine.com/oauth2/token/?client_id=' + client_id + '&client_secret=' + client_secret + '&code='+ code + '&grant_type=authorization_code' + '&redirect_uri=' + redirect_uri, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        apiResponse = body
        res.redirect('/');
      }
    })
}

// SOCKET THINGIESS HERE
function onConnect(socket) {

}

var port = process.env.PORT || 8888;

http.listen(port, function (){
    console.log('server is running: on: ' + port);
});
