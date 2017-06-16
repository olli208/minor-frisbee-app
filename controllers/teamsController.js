var rp = require('request-promise');

exports.getTeamDetail = function (req, res) {
  rp(`http://api.playwithlv.com/v1/teams/${req.params.id}/?access_token=${req.session.accessToken}`)
    .then(function (body) {
      var data = JSON.parse(body);

      res.render('teams-detail', {data});
    })
    .catch(function (err) {
      console.log('error getting TEAM DETAIL');
    });
}