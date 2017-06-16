exports.index = function (req , res) {
  if (req.session.accessToken === undefined) {
    res.render('index')
  } else {
    res.redirect('/games');
  }
}

exports.confirmOauth = function (req, res) {
  res.render('confirm-oauth');
}