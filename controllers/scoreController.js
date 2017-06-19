var request = require('request');
var moment = require('moment');
var rp = require('request-promise');

exports.updateScore = function (req, res) {
  var timeOfUpdate = moment().format();

  rp(`http://api.playwithlv.com/v1/game_scores/?game_id=${req.session.gameID}&access_token=${req.session.accessToken}`)
  .then(function (body) {
      var data = JSON.parse(body);
      var dataObj = data.objects[0];

      console.log(dataObj.time_last_updated);
      console.log(dataObj.team_1_score);
      console.log(dataObj.team_2_score);

      // 1. Compare time stamps of both
      if (1 + 1 === 2) {
        // 2. post depending on comparison..
        console.log('WAT SLIM')
         postUpdate(req, res)
      }

  })

  delete req.session.gameID;

  console.log(timeOfUpdate);
  // TODO -> request score of this game first
  // Check time of last update compare and update
  // only if this time is more recent and if score is changed at all
  // We post request the score to the api.
  // If we have a mongodb database now is the time to update the score there  also
}

function postUpdate(req, res) {
  var team1_score = req.body.team1_score;
  var team2_score = req.body.team2_score;
  var scorer = req.body.scorer;
  var assist = req.body.assist;
  var gameID = req.body.game_id;

  var score = {
    'game_id': gameID,
    'team_1_score': team1_score,
    'team_2_score': team2_score,
    // 'what_happened': `scorer: ${scorer} , assist: ${assist}`, // TODO -> store scorer and assist on own db
    'is_final': 'False'
  };

  console.log(req.session.accessToken);

  if (req.session.accessToken === undefined) {
    res.redirect('/confirm');
  } else {
    // TODO First request rurrent score for the game and check date
    // if date is later then the date when this request post is then cancel this post and return message to user.
    request.post({
      url: 'http://api.playwithlv.com/v1/game_scores/',
      headers: {
        'Authorization': `bearer ${req.session.accessToken}`
      },
      json: true,
      body: score
    }, function (err, response, body) {
      console.log(body);
      res.redirect('/games')
    });
  }

}