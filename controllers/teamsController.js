var rp = require('request-promise');
var mongoose = require('mongoose');
var Team = mongoose.model('Team');

exports.getTeamDetail = function (req, res) {
  rp(`http://api.playwithlv.com/v1/teams/${req.params.id}/?access_token=${req.session.accessToken}`)
    .then(function (body) {
      var teamData = JSON.parse(body);

      return rp(`http://api.playwithlv.com/v1/games/?%5B${teamData.id}%5D&access_token=${req.session.accessToken}`)
        .then(function (body) {
          var teamGames = JSON.parse(body);

          res.render('teams-detail', {
            data: teamData,
            games: teamGames.objects
          });

        })
        .catch(function (err) {
          console.log(`error getting TEAM DETAIL GAMES -> ${err}`)
        })

    })
    .catch(function (err) {
      console.log('error getting TEAM DETAIL');
    });
}