var rp = require('request-promise');

exports.login = function (req, res) {
  res.redirect(`http://www.playwithlv.com/oauth2/authorize/?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=universal`);
}

exports.callback = function (req, res) {
  var code = req.query.code;

  rp(`http://www.playwithlv.com/oauth2/token/?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`)
    .then(function (body) {
      data = JSON.parse(body);
      req.session.accessToken = data.access_token;

      res.redirect(req.session.returnTo || '/games');
      delete req.session.returnTo;
    })
    .catch(function (err) {
      console.log('CALLBACK error', err);
    });
}