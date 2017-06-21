var rp = require('request-promise');

exports.getSwissStandings = function (req, res) {
  rp(`http://api.playwithlv.com/v1/swiss_rounds/?swiss_round_ids=%5B${req.params.id}%5D&access_token=${req.session.accessToken}`)
    .then( function (body) {
      var data = JSON.parse(body);
      var swissStandings = data.objects[0];
      var swissStandingsSort = swissStandings.standings.sort((a , b) => parseInt(b.ranking) > parseInt(a.ranking) ? -1 : 1);

      res.render('swiss-standings', {
        round_number: swissStandings.round_number,
        data: swissStandingsSort,
        lastUpdate: swissStandings.time_last_updated
      })
    })
}