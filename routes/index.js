var express = require('express');
var router = express.Router();
var request = require('request');
var querystring = require('querystring');

require('dotenv').config(); // secret stuff

// Controller imports
var indexController = require('../controllers/indexController');
var loginController = require('../controllers/loginController');
var gamesController = require('../controllers/gamesController');
var teamsController = require('../controllers/teamsController');
var scoreController = require('../controllers/scoreController');
var swissRankController = require('../controllers/swissRankController');

// Oauth
router.get('/', indexController.index);
router.get('/confirm', indexController.confirmOauth);
router.get('/login', loginController.login);
router.get('/callback', loginController.callback);

// Teams
router.get('/teams/:id', teamsController.getTeamDetail);

// games + score
router.get('/games', gamesController.getGames);
router.get('/games/:id', gamesController.getGames);
router.get('/update/:id', gamesController.gameUpdate);
router.post('/update_score', scoreController.updateScore);

// Swiss Standings + rounds etc
router.get('/swiss-standings/:id', swissRankController.getSwissStandings)


module.exports = router;