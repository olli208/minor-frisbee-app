var request = require('request');
var moment = require('moment');
var rp = require('request-promise');
var mongoose = require('mongoose');
var Game = mongoose.model('Game');

exports.updateScore = function (req, res) {
  var dateFormat = 'YYYY-MM-DDTHH:mm:ss';
  var timeOfUpdate = moment().format(dateFormat + '.427Z');

  // console.log('TIJD BIJ KNOP ->' , timeOfUpdate);
  console.log(`REQ.SESH.GAMEID -> ${req.session.gameID}`);

  rp(`http://api.playwithlv.com/v1/game_scores/?game_id=${req.session.gameID}&access_token=${req.session.accessToken}`)
  .then(function (body) {
      var data = JSON.parse(body);
      var dataObj = data.objects[0];

      var lastUpdate = moment(dataObj.time_last_updated).format(dateFormat + '.427Z')

      // console.log('TIJD VAN API ->' , lastUpdate); // TODO -> better solution for the time check.

      // 1. Compare time stamps of both
      if (timeOfUpdate > lastUpdate) {
        // 2. post depending on comparison..
        postUpdate(req, res);
      } else if (lastUpdate > timeOfUpdate) {
        // 3. If the score has already been recently updated ...
        // ... show flash message to user
        req.flash('warning' , 'SCORE HAS ALREADY BEEN UPDATED');
        res.redirect('/games');
      }
  })

  delete req.session.gameID;
}

function postUpdate (req, res) {
  if (req.session.accessToken === undefined) {
    res.redirect('/confirm');
  } else {
    var team1_score = req.body.team1_score;
    var team2_score = req.body.team2_score;
    var scorer = req.body.scorer;
    var assist = req.body.assist;
    var gameID = req.body.game_id;
    var team1 = req.body.team_1;
    var team2 = req.body.team_2;

    var score = {
      'game_id': gameID,
      'team_1_score': team1_score,
      'team_2_score': team2_score,
      'is_final': 'False'
    };

    request.post({
      url: 'http://api.playwithlv.com/v1/game_scores/',
      headers: {
        'Authorization': `bearer ${req.session.accessToken}`
      },
      json: true,
      body: score
    }, function (err, response, body) {
      // console.log(body);
      storeToDB(team1, team1_score, team2, team2_score, gameID , req, res)
    });
  }
}

function storeToDB (team1, team1_score, team2, team2_score, gameID, req, res ) {
  var scoreUpdate = {
    team_1_score: team1_score,
    team_2_score: team2_score,
  }

  var game = Game.findOneAndUpdate(
    {'gameID': gameID},
    scoreUpdate,
    {new: true}).exec();

  game
    .then(function(game) {
      req.flash('success', `${team1} (${team1_score}) - (${team2_score}) ${team2} `);

      res.redirect('back');
      
      return gameID;
    })
    .then(function(gameID) {
      var games = Game.find({'gameID': { $in: gameID }});
      
      games
        .then(function (games) {
          io.emit('games DB', { games });
        })
        .catch(function (err) {
          console.log(`Could not find GAMES from DATABASE -> ${err}`)
        })
    })
    .catch(function(err) {
      console.log(`Could not update GAMESCORE from DATABASE -> ${err}`)
    })
}