var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
var querystring = require('querystring');

require('dotenv').config(); // secret stuff

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri =  process.env.REDIRECT_URI; // For local testing !! (8888 for real / 8000 for test api)

var apiResponse,
  acccessToken;

// Oauth
router.get('/', index);
router.get('/login', login);
router.get('/callback', callback);
router.get('/confirm', confirmOauth);

// Teams
router.get('/teams', getTeams);
router.get('/teams/:id', getTeamDetail);

// games + score
router.get('/games', getGames);
router.get('/games/:id', gameUpdate);
router.post('/update_score', updateScore);

function index (req , res) {
  if (acccessToken === undefined) {
    res.render('index')
  } else {
    res.redirect('/games');
  }
}

function confirmOauth (req, res) {
  res.render('confirm-oauth');
}

function login (req, res) {
  res.redirect('http://www.playwithlv.com/oauth2/authorize/?' + 'client_id=' + client_id + '&response_type=code' + '&redirect_uri=' + redirect_uri + '&scope=universal');
}

function callback (req, res) {
  var code = req.query.code;

  rp('http://www.playwithlv.com/oauth2/token/' + '?client_id=' + client_id + '&client_secret=' + client_secret + '&code='+ code + '&grant_type=authorization_code' + '&redirect_uri=' + redirect_uri)
    .then(function (body) {
      apiResponse = JSON.parse(body);
      acccessToken = apiResponse.access_token;

      res.redirect('/games')
    })
    .catch(function (err) {
      console.log('CALLBACK error', err);
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

function getGames (req, res) {
  console.log('ACCESTOKEN?:' , acccessToken)
  rp('http://api.playwithlv.com/v1/games/?tournament_id=20059&access_token=' + acccessToken)
    .then(function (body) {
      var data = JSON.parse(body);

      console.log(data)

      res.render('games', {
        games: data.objects
      });
    })
    .catch(function (err) {
      console.log('error getting GAMES');
    });
}

function gameUpdate (req, res) {
  if (!acccessToken) {
    res.redirect('/confirm')
  } else {
    rp('http://api.playwithlv.com/v1/games/'+ req.params.id +'/?access_token=' + acccessToken)
      .then(function (body) {
        var data = JSON.parse(body);

        res.render('game-update' , {game: data});
      })
      .catch(function (err) {
        console.log('error UPDATING GAME');
      });
  }
}

function updateScore (req, res) {
  team1_score = req.body.team1_score;
  team2_score = req.body.team2_score;
  scorer = req.body.scorer;
  assist = req.body.assist;
  gameID = req.body.game_id;

  var score = {
    'game_id': gameID,
    'team_1_score': team1_score,
    'team_2_score': team2_score,
    // 'what_happened': `scorer: ${scorer} , assist: ${assist}`, // TODO -> store scorer and assist on own db
    'is_final': 'False'
  };

  request.post({
    url: 'http://api.playwithlv.com/v1/game_scores/',
    headers: {
      'Authorization': `bearer ${acccessToken}`
    },
    json: true,
    body: score
  }, function (err, response, body) {
    console.log(body);
    res.redirect('/games')
  });
}

module.exports = router;