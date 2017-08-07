var rp = require('request-promise');

exports.getSwissStandings = function (req, res) {
  rp(`http://api.playwithlv.com/v1/swiss_rounds/?swiss_round_ids=%5B${req.params.id}%5D&access_token=${req.session.accessToken}`)
    .then( function (body) {
      var data = JSON.parse(body);
      var swissStandings = data.objects[0];
      var swissStandingsSort = swissStandings.standings.sort((a , b) => parseInt(b.ranking) > parseInt(a.ranking) ? -1 : 1);

      var tournamentName = data.objects.map(function(obj) {
        return obj.tournament.name
      }).filter(function(elem, pos, arr) {
        return arr.indexOf(elem) == pos;
      });

      res.render('swiss-standings', {
        games: data.objects || {},
        round_number: swissStandings.round_number,
        round_id: swissStandings.id,
        data: swissStandingsSort,
        lastUpdate: swissStandings.time_last_updated,
        tournamentLong: tournamentName,
        tournamentShort: tournamentNameShort(tournamentName)
      })
    })
}

function tournamentNameShort(name) {
  var n = name[0].split(" ");
  return n[n.length - 1];
}