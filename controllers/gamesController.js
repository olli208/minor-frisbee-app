var rp = require('request-promise');
var moment = require('moment');
var mongoose = require('mongoose');
var Game = mongoose.model('Game')

exports.getGames = function (req, res, next) {
  var tournamentID;
  if (req.params.id === undefined) {
    tournamentID = '19750'
  } else if (req.params.id !='undefined') {
    tournamentID = req.params.id;
  }

  console.log('ACCESTOKEN?:' , req.session.accessToken);

  // ! playwithlv api doesnt have 2017 games so we will have to hard code the dates from 2015.
  var dateFormat = 'YYYY-MM-DDTHH:mm:ss';
  var now = moment('2015-06-12T09:00:00.427144+02:00');
  var till = moment(now).add(3, 'h');

  var nowFormat = now.format(dateFormat) + '.427Z';
  var tillFormat = till.format(dateFormat) + '.427Z';

  var limit = '10';

  // example request: `https://api.leaguevine.com/v1/games/?tournament_id=20059&starts_before=2016-06-03T13%3A00%3A00.427144%2B00%3A00&starts_after=2016-06-03T06%3A00%3A00.427144%2B00%3A00&order_by=%5Bstart_time%5D&access_token=${acccessToken}`
  rp(`http://api.playwithlv.com/v1/games/?tournament_id=${tournamentID}&starts_before=${tillFormat}&starts_after=${nowFormat}&order_by=['start_time']&limit=${limit}&access_token=${req.session.accessToken}`)
    .then(function (body) {
      req.session.returnTo = req.path;
      var data = JSON.parse(body);

      var swissRounds = data.objects.map(function (obj) {
        return obj.swiss_round_id
      })

      var filterSwissRounds = swissRounds.filter(function(elem, pos) {
        return swissRounds.indexOf(elem) == pos;
      });

      console.log('SWISS ROUNDS ->', filterSwissRounds)

      return rp(`http://api.playwithlv.com/v1/swiss_rounds/?swiss_round_ids=%5B${filterSwissRounds}%5D&access_token=${req.session.accessToken}`)
        .then( function (body) {
          var data = JSON.parse(body);
          var swissStandings = data.objects[0];

          return swissStandings
        })
        .then(function (swissStandings) {
          var swissStandingsSort = swissStandings.standings.sort((a , b) =>
          parseInt(b.ranking) > parseInt(a.ranking) ? -1 : 1)
          .filter((team) => (team.ranking >= 1 && team.ranking <= 15)
          );

          res.render('games', {
            games: data.objects || {},
            swiss: swissStandingsSort || {}
          });

          formatData(data.objects , tournamentID);

        })
        .catch(function (err) {
          console.log('error getting SWISS STANDINGS on GAMES page', err);
        });

    })
    .catch(function (err) {
      console.log('error getting GAMES', err);
    });

}

function formatData (games, tournamentID) {
  games.forEach(function (obj) {
    var formatGame = {
      gameID: obj.id,
      team_1: {
        score: obj.team_1_score,
        name: obj.team_1.name,
        teamID: obj.team_1.id,
      },
      team_2: {
        score: obj.team_2_score,
        name: obj.team_2.name,
        teamID: obj.team_1.id,
      },
      startTime: obj.start_time,
      swissRoundId: obj.swiss_round.id,
      swissRoundNumber: obj.swiss_round.round_number,
      gameSite: obj.game_site.name,
      tournamentID: tournamentID,
      tournamentStyle: obj.tournament.name
    }

    var game = new Game(formatGame);

    game.save()
      .then(function (games) {
        // console.log(games);
        console.log('SUCCESS!! NEW DATA ADDED!')
      })
      .catch( function (err) {
        console.log(`FAILED to add to DATABSE -> ${err}`);
      });

  })
}

exports.gameUpdate = function (req, res) {
  req.session.gameID = req.params.id;

  rp(`http://api.playwithlv.com/v1/game_scores/?game_id=${req.params.id}&access_token=${req.session.accessToken}`)
    .then(function (body) {
      var data = JSON.parse(body);

      req.session.returnTo = req.path;
      res.render('game-update' , {game: data.objects[0] || 'No game found' });
    })
    .catch(function (err) {
      console.log('error UPDATING GAME');
    });
}