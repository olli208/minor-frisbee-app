var request = require('request');

exports.updateScore = function (req, res) {
  team1_score = req.body.team1_score;
  team2_score = req.body.team2_score;
  scorer = req.body.scorer;
  assist = req.body.assist;
  gameID = req.body.game_id;

  var score = {
    'game_id': gameID,
    'team_1_score': team1_score,
    'team_2_score': team2_score,
    // 'what_happened': `scorer: ${scorer} , assist: ${assist}`, // TODO -> store scorer and assist on own db
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
    console.log(body);
    res.redirect('/games')
  });
}