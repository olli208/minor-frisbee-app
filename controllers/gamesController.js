var rp = require('request-promise');
var moment = require('moment');
var mongoose = require('mongoose');
var Game = mongoose.model('Game');
var Chat = mongoose.model('Chat');

var dateFormat = 'YYYY-MM-DDTHH:mm:ss';

exports.getGames = function (req, res) {
  var tournamentID;
  if (req.params.id === undefined) {
    tournamentID = '19750';
  } else if (req.params.id != 'undefined') {
    tournamentID = req.params.id;
  }

  // ! playwithlv api doesnt have 2017 games so we will have to hard code the dates from 2015.
  var now = moment(process.env.FAKE_DATE);
  var till = moment(now).add(2, 'h');

  var nowFormat = now.format(dateFormat) + '.427Z';
  var tillFormat = till.format(dateFormat) + '.427Z';

  var limit = '15';

  rp(`http://api.playwithlv.com/v1/games/?tournament_id=${tournamentID}&starts_before=${tillFormat}&starts_after=${nowFormat}&order_by=['start_time']&limit=${limit}`)
    .then(function (body) {
      var data = JSON.parse(body);

      var swissRounds = data.objects.map(function(obj) {
        return obj.swiss_round_id
      }).filter(function (elem, pos, arr) {
        return arr.indexOf(elem) == pos;
      });

      console.log('SWISS ROUNDS ->', swissRounds) // check to see which round are included in this request

      var tournamentName = data.objects.map(function(obj) {
        return obj.tournament.name
      }).filter(function(elem, pos, arr) {
        return arr.indexOf(elem) == pos;
      });

      var winners = []

      data.objects.forEach(function(obj) {
        winners.push(obj.winner)
      })

      gamesToDB(data.objects , tournamentID);

      var info = {
        games: data.objects || {},
        tournamentLong: tournamentName,
        tournamentShort: tournamentNameShort(tournamentName),
        winners
      }

      return info
    })
    .then(function (info) {
      rp(`http://api.playwithlv.com/v1/swiss_rounds/?swiss_round_ids=%5B${info.games[0].swiss_round_id}%5D&access_token=${req.session.accessToken}`)
      .then( function (body) { 
        var swissRank = JSON.parse(body);
        var swissStandings = swissRank.objects[0];
        var swissStandingsSort = swissStandings.standings.sort((a , b) => parseInt(b.ranking) > parseInt(a.ranking) ? -1 : 1);

        var tournamentName = swissRank.objects.map(function(obj) {
          return obj.tournament.name
        }).filter(function(elem, pos, arr) {
          return arr.indexOf(elem) == pos;
        });

        res.render('games', {
          games: info.games || {},
          tournamentLong: info.tournamentLong,
          tournamentShort: tournamentNameShort(info.tournamentLong),
          winners: info.winners,
          round_number: swissStandings.round_number,
          round_id: swissStandings.id,
          data: swissStandingsSort,
          lastUpdate: swissStandings.time_last_updated,
          tournamentLong: tournamentName,
          tournamentShort: tournamentNameShort(tournamentName)
        })
      })
    })
    .catch(function (err) {
      console.log('error getting GAMES', err);
    });
}

function tournamentNameShort(name) {
  var n = name[0].split(" ");
  return n[n.length - 1];
}

function gamesToDB (games, tournamentID) {
  games.forEach(function (obj) {
    var formatGame = {
      gameID: obj.id,
      team_1_score: obj.team_1_score,
      team_2_score: obj.team_2_score,
      team_1: {
        name: obj.team_1.short_name,
        teamID: obj.team_1.id,
      },
      team_2: {
        score: obj.team_2_score,
        name: obj.team_2.short_name,
        teamID: obj.team_2.id,
      },
      startTime: moment(obj.start_time).format(dateFormat) + '.427Z',
      swissRoundId: obj.swiss_round.id,
      swissRoundNumber: obj.swiss_round.round_number,
      gameSite: obj.game_site.name,
      tournamentID: tournamentID,
      tournamentStyle: obj.tournament.name
    }

    new Game(formatGame)
      .save()
      .then(function (games) {
        // console.log(games);
        console.log('SUCCESS!! NEW DATA ADDED!')
      })
      .catch(function (err) {
        // console.log(`ADDING TO DB ERROR -> ${err}`)
      })
  })
}

function getGamesDB (tournamentID) {
  var games = Game.find({
    'tournamentID': tournamentID,
    'startTime': {$gt: moment('2015-06-12T09:00:00.427144+02:00')} // ! playwithlv api doesnt have 2017 games so we will have to hard code the dates from 2015.
  })

  games
    .then(function(games){
      console.log(`games from DB -> ${games}`);
    })
    .catch(function(err) {
      console.log(`Could not get GAMES data from DATABASE -> ${err}`)
    })
}

exports.gameUpdate = function (req, res) {
  req.session.gameID = req.params.id;

  rp(`http://api.playwithlv.com/v1/games/${req.params.id}/?access_token=${req.session.accessToken}`)
    .then(function (body) {
      var data = JSON.parse(body);

      var score = Game.find({'gameID': { $in: data.id }});

      score
      .then(function (score) {
        req.session.returnTo = req.path;

        chat(data , score , req , res)

      })
      .catch(function (err) {
        console.log(`Could not find GAMES from DATABASE -> ${err}`)
      })
      
    })
    .catch(function (err) {
      console.log('error UPDATING GAME');
    });
}

function chat(data , score , req, res ) {
    var chatRoom = Chat.find({'gameID': data.id });
    
    chatRoom
      .then(function (chat) {
        req.session.return = req.path;
        var messages = [];
  
        chat.forEach(function (e) {
          messages.push(e);
        })
  
        res.render('game-update' , {
          game: data || 'No game found',
          accessToken: req.session.accessToken,
          team1Score: score[0].team_1_score,
          team2Score: score[0].team_2_score,
          messages: messages.reverse() || ''
        });

      })
      .catch(function (err) {
        console.log(`FINDING MESSAGES FROM DB ERROR -> ${err}`)
      })
}