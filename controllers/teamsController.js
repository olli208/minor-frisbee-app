var rp = require('request-promise');
var mongoose = require('mongoose');
var mongoose = require('mongoose');
var Game = mongoose.model('Game');

exports.getTeamDetail = function (req, res) {
  rp(`http://api.playwithlv.com/v1/teams/${req.params.id}/?access_token=${req.session.accessToken}`)
    .then(function (body) {
      var teamData = JSON.parse(body);

      var games = Game.find({}).where({ "team_1.teamID": String(teamData.id) });

      games
        .then(function(games){
          console.log(`games from DB -> ${games}`);
          res.render('teams-detail', {
                    data: teamData,
                    games: games
                  });
        })
        .catch(function(err) {
          console.log(`Could not find GAMES from DATABASE -> ${err}`)
        })

    //   return rp(`http://api.playwithlv.com/v1/games/?%5B${teamData.id}%5D&access_token=${req.session.accessToken}`)
    //     .then(function (body) {
    //       var teamGames = JSON.parse(body);
    //
    //       res.render('teams-detail', {
    //         data: teamData,
    //         games: teamGames.objects
    //       });
    //
    //     })
    //     .catch(function (err) {
    //       console.log(`error getting TEAM DETAIL GAMES -> ${err}`)
    //     })
    //
    // })
    // .catch(function (err) {
    //   console.log('error getting TEAM DETAIL');
    // });
  })
}