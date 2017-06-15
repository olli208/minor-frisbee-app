var express = require('express');
var router = express.Router();
var request = require('request');
var rp = require('request-promise');
var querystring = require('querystring');

require('dotenv').config(); // secret stuff

var apiResponse,
  acccessToken;

// Oauth
router.get('/', index);
router.get('/login', login);
router.get('/callback', callback);
router.get('/confirm', confirmOauth);

router.get('/test', function (req, res) {
});

// Teams
router.get('/teams', getTeams);
router.get('/teams/:id', getTeamDetail);

// games + score
router.get('/games', getGames);
router.get('/games/:id', gameUpdate);
router.post('/update_score', updateScore);

// Swiss Standings + rounds etc
router.get('/swiss-standings/:id', getSwissStandings)

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
  res.redirect(`http://www.playwithlv.com/oauth2/authorize/?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=universal`);
}

function callback (req, res) {
  var code = req.query.code;

  rp(`http://www.playwithlv.com/oauth2/token/?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`)
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
  rp(`http://api.playwithlv.com/v1/tournament_teams/?tournament_ids=%5B20059%5D&access_token=${acccessToken}`)
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
  rp(`http://api.playwithlv.com/v1/teams/${req.params.id}/?access_token=${acccessToken}`)
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
  // ! playwithlv api doesnt have 2017 games so we will have to hard code the dates from 2016
  // var now = new Date().toISOString(); // only works when tourney is on

  // TODO -> Fix date so its from Netherlands (not super important ATM)
  var now = new Date('2016-06-03T09:00:00.427144+02:00');
  var till = new Date(now);
  till.setHours(till.getHours()+5)
  var nowISOString = toISO(now);
  var tillISOString = toISO(till);

  function toISO (date) {
    return date.toISOString()
  }

  console.log(nowISOString , tillISOString);

  var limit = '20'
  var swissStandings

  // example request: `https://api.leaguevine.com/v1/games/?tournament_id=20059&starts_before=2016-06-03T13%3A00%3A00.427144%2B00%3A00&starts_after=2016-06-03T06%3A00%3A00.427144%2B00%3A00&order_by=%5Bstart_time%5D&access_token=${acccessToken}`
  rp(`http://api.playwithlv.com/v1/games/?tournament_id=20059&starts_before=${tillISOString}&starts_after=${nowISOString}&order_by=%5Bstart_time%5D&limit=${limit}&access_token=${acccessToken}`)
    .then(function (body) {
      var data = JSON.parse(body);

      var swissRounds = data.objects.map(function (obj) {
        return obj.swiss_round_id
      })

      var filterSwissRounds = swissRounds.filter(function(elem, pos) {
        return swissRounds.indexOf(elem) == pos;
      });

      console.log(filterSwissRounds)

      return rp(`http://api.playwithlv.com/v1/swiss_rounds/?swiss_round_ids=%5B${filterSwissRounds}%5D&limit=15&access_token=${acccessToken}`)
        .then( function (body) {
          var data = JSON.parse(body);
          console.log(data)
          swissStandings = data.objects[0];

          return swissStandings
        })
        .then(function (swissStandings) {
          var swissStandingsSort = swissStandings.standings.sort((a , b) => parseInt(b.swiss_score) > parseInt(a.swiss_score) ? 1 : -1);

          // console.log(swissStandingsSort)
          const swissTop12 = swissStandingsSort.filter(team => (team.ranking >= 1 && team.ranking <= 15));

          res.render('games', {
            games: data.objects,
            swiss: swissTop12
          });
        })
        .catch(function (err) {
          console.log('error getting SWISS STANDINGS on GAMES page', err);
        });

    })
    .catch(function (err) {
      console.log('error getting GAMES', err);
    });

}

function gameUpdate (req, res) {
  if (!acccessToken) {
    res.redirect('/confirm')
  } else {
    rp(`http://api.playwithlv.com/v1/games/${req.params.id}/?access_token=${acccessToken}`)
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

function getSwissStandings (req, res) {
  rp(`http://api.playwithlv.com/v1/swiss_rounds/?swiss_round_ids=%5B${req.params.id}%5D&access_token=${acccessToken}`)
    .then( function (body) {
      var data = JSON.parse(body);
      var swissStandings = data.objects[0];
      var swissStandingsSort = swissStandings.standings.sort((a , b) => parseInt(b.swiss_score) > parseInt(a.swiss_score) ? 1 : -1);

      // console.log(swissStandings);

      res.render('swiss-standings', {
        round_number: swissStandings.round_number,
        data: swissStandingsSort
      })
    })
}

module.exports = router;