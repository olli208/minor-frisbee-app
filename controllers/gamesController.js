var rp = require('request-promise');

var tournamentIDMixed = '19750' // Windmill 2015: MIXED
var tournamentIDOpen = '19746' // Windmill 2015: OPEN
var tournamentIDWomen = '19747' // Windmill 2015: WOMENS

exports.getGames = function (req, res) {
  console.log('ACCESTOKEN?:' , req.session.accessToken)
  // ! playwithlv api doesnt have 2017 games so we will have to hard code the dates from 2015.

  // TODO -> Fix date so its from Netherlands (not super important ATM)
  // TODO -> fix when changing date to 4 or 5 june no data is returned. (Working on normal leaguevine
  // var now = new Date().toISOString(); // only works when tourney is on
  var now = new Date('2015-06-12T09:00:00.427144+02:00');
  var till = new Date(now);
  till.setHours(till.getHours()+5)
  var nowISOString = toISO(now);
  var tillISOString = toISO(till);

  function toISO (date) {
    return date.toISOString()
  }

  console.log(nowISOString , tillISOString);

  var limit = '20'

  // example request: `https://api.leaguevine.com/v1/games/?tournament_id=20059&starts_before=2016-06-03T13%3A00%3A00.427144%2B00%3A00&starts_after=2016-06-03T06%3A00%3A00.427144%2B00%3A00&order_by=%5Bstart_time%5D&access_token=${acccessToken}`
  rp(`http://api.playwithlv.com/v1/games/?tournament_id=${tournamentIDMixed}&starts_before=${tillISOString}&starts_after=${nowISOString}&order_by=['start_time']&limit=${limit}&access_token=${req.session.accessToken}`)
    .then(function (body) {
      var data = JSON.parse(body);

      var swissRounds = data.objects.map(function (obj) {
        return obj.swiss_round_id
      })

      var filterSwissRounds = swissRounds.filter(function(elem, pos) {
        return swissRounds.indexOf(elem) == pos;
      });

      // res.render('games', {
      //   games: data.objects, // this or swissStandings.games is also possible
      // });

      return rp(`http://api.playwithlv.com/v1/swiss_rounds/?swiss_round_ids=%5B${filterSwissRounds}%5D&access_token=${req.session.accessToken}`)
        .then( function (body) {
          var data = JSON.parse(body);

          var swissStandings = data.objects[0];

          return swissStandings
        })
        .then(function (swissStandings) {
          var swissStandingsSort = swissStandings.standings.sort((a , b) =>
          parseInt(b.ranking) > parseInt(a.ranking) ? -1 : 1)
          .filter(team => (team.ranking >= 1 && team.ranking <= 15));

          // console.log(swissStandingsSort)

          res.render('games', {
            games: data.objects, // this or swissStandings.games is also possible
            swiss: swissStandingsSort
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

exports.gameUpdate = function (req, res) {
  if (!req.session.accessToken) {
    res.redirect('/confirm')
  } else {
    rp(`http://api.playwithlv.com/v1/games/${req.params.id}/?access_token=${req.session.accessToken}`)
      .then(function (body) {
        var data = JSON.parse(body);

        res.render('game-update' , {game: data});
      })
      .catch(function (err) {
        console.log('error UPDATING GAME');
      });
  }
}