var express = require('express');
var router = express.Router();
var rp = require('request-promise');

router.get('/games', getGames);
router.get('/games/:id', gameUpdate);

function getGames (req, res) {
  console.log('ACCESTOKEN?:' , acccessToken)
  rp('http://api.playwithlv.com/v1/games/?tournament_id=20059&access_token=' + acccessToken)
    .then(function (body) {
      var data = JSON.parse(body);

      res.render('games', {
        games: data.objects
      });
    })
    .catch(function (err) {
      console.log('error getting GAMES');
    });
}

function gameUpdate (req, res) {
  if (!acccessToken) {
    res.redirect('/confirm')
  } else {
    rp('http://api.playwithlv.com/v1/games/'+ req.params.id +'/?access_token=' + acccessToken)
      .then(function (body) {
        var data = JSON.parse(body);

        res.render('game-update' , {game: data});
      })
      .catch(function (err) {
        console.log('error UPDATING GAME');
      });
  }
}

module.exports = router;