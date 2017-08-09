var rp = require('request-promise');
var mongoose = require('mongoose');
var moment = require('moment');
var Game = mongoose.model('Game');

var dateFormat = 'YYYY-MM-DDTHH:mm:ss';

exports.getTeamDetail = function (req, res) {
  rp(`http://api.playwithlv.com/v1/teams/${req.params.id}/?access_token=${req.session.accessToken}`)
    .then(function (body) {
      var teamData = JSON.parse(body);

      var games = Game.find({}).where({"team_1.teamID": String(teamData.id)});

      games
        .then(function (games) {
          var lastGame = new Date(Math.max.apply(null, games.map(function(e) {
            return e.startTime
          })));

          rp(`http://api.playwithlv.com/v1/games/?%5B${teamData.id}%5D&starts_after=${lastGame.toISOString()}&access_token=${req.session.accessToken}`)
            .then(function (body) {
              var nextGames = JSON.parse(body);

              console.log(nextGames.objects)

              res.render('teams-detail', {
                data: teamData || {},
                games: games || {},
                next: nextGames.objects
              });

            })
            .catch(function (err) {
              console.log(`error getting TEAM DETAIL GAMES -> ${err}`)
            })
        })
        .catch(function (err) {
          console.log(`Could not find GAMES from DATABASE -> ${err}`)
        })
    })
}