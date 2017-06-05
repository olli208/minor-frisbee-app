var express = require('express');
var app = express();
var session = require('express-session');

// Socket requires
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var path = require('path');
var request = require('request');
var rp = require('request-promise'); // request promise package
var querystring = require('querystring');
require('dotenv').config(); //secret stuff
var bodyParser = require('body-parser');

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
    }))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }));

var apiResponse,
    acccessToken;

// TODO Modular routes
io.on('connect', onConnect);

// Oauth
app.get('/', index);
app.get('/login', login);
app.get('/callback', callback);

// Teams
app.get('/teams', getTeams);
app.get('/teams/:id', getTeamDetail);

// Game
app.get('/games', getGames);
app.get('/games/:id', gameUpdate);
app.post('/update_score', updateScore);

function index (req , res) {
  if (acccessToken) {
    res.redirect('/games');
  } else {
    res.render('index');
  }
}

function login (req, res) {
  res.redirect('https://www.leaguevine.com/oauth2/authorize/?' + 'client_id=' + client_id + '&response_type=code' + '&redirect_uri=' + redirect_uri + '&scope=universal');
}

function callback (req, res) {
  var code = req.query.code;

  rp('https://www.leaguevine.com/oauth2/token/' + '?client_id=' + client_id + '&client_secret=' + client_secret + '&code='+ code + '&grant_type=authorization_code' + '&redirect_uri=' + redirect_uri)
    .then(function (body) {
      apiResponse = JSON.parse(body);
      acccessToken = apiResponse.access_token;

      res.redirect('/games');
    })
    .catch(function (err) {
      console.log('CALLBACK error');
    });
}

function getTeams (req, res) {
  rp('http://api.playwithlv.com/v1/tournament_teams/?tournament_ids=%5B20059%5D&access_token=' + acccessToken)
    .then(function (body) {
      var data = JSON.parse(body);

      res.render('teams', {
        teams: data.objects
      });
    })
    .catch(function (err) {
      console.log('error getting TEAMS');
    });
}

function getTeamDetail (req, res) {
  rp('http://api.playwithlv.com/v1/teams/'+ req.params.id + '/?access_token=' + acccessToken)
    .then(function (body) {
      var data = JSON.parse(body);

      res.render('teams-detail', {data});
    })
    .catch(function (err) {
      console.log('error getting TEAM DETAIL');
    });
}

function getGames(req, res) {
    rp('http://api.playwithlv.com/v1/games/?tournament_id=20059&access_token=' + acccessToken)
    .then(function (body) {
      var data = JSON.parse(body);

      res.render('games', {games: data.objects});
    })
    .catch(function (err) {
      console.log('error getting GAMES');
    });
}

function gameUpdate(req, res) {
  rp('http://api.playwithlv.com/v1/games/'+ req.params.id +'/?access_token=' + acccessToken)
    .then(function (body) {
      var data = JSON.parse(body);

      res.render('game-update' , {game: data});
    })
    .catch(function (err) {
      console.log('error UPDATING GAME');
    });
}

function updateScore(req, res) {
  team1_score = req.body.team1_score;
  team2_score = req.body.team2_score;
  scorer = req.body.scorer;
  assist = req.body.assist;
  console.log(team1_score, team2_score, scorer, assist);
}

//  SOCKET THINGIESS HERE
function onConnect (socket) {
  //  socket stuff
}

var port = process.env.PORT || 8888;

http.listen(port, function (){
    console.log('server is running on: ' + port);
});
