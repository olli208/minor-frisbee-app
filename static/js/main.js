(function() {
  "use strict"

  var socket = io();

  var app = {
    init: function() {
      score.add();
      flashMessage.close();
      realTime.io();
    }
  }

  var score = {
    add: function() {
      var self = this;

      if (document.getElementById('score-team1')) {                
        document.querySelectorAll('.add-score').forEach(function (elem){
          elem.addEventListener('click', self.update);
        })

      }
    },
    update: function(e) {
      var scoreBoard1 = document.getElementById('score-team1');
      var scoreBoard2 = document.getElementById('score-team2');
      var scoreTeam1 = parseInt(scoreBoard1.value);
      var scoreTeam2 = parseInt(scoreBoard2.value);

      if (e.target.className === 'add-score1') {
          var newScore = ++scoreTeam1;
          scoreTeam1 = newScore;
          scoreBoard1.value = newScore;
      } else if (e.target.className === 'add-score2') {
          var newScore = ++scoreTeam2;
          scoreTeam2 = newScore;
          scoreBoard2.value = newScore;
      }

    }
  }

  var flashMessage = {
    close: function() {
      var elem = document.getElementById('close-message');
      
      if (elem) {
        elem.addEventListener('click', function(e){
          e.target.parentNode.className += " closed";
        });
      }
      
    }
  } 

  var realTime = {
    io: function() {
      var el = document.querySelector('.score-info');
      var gameID = el.querySelector('input[name="game_id"]').value;

      var self = this;
      var elem = document.querySelectorAll('.game');
      var gameIDs = [];

      elem.forEach(function (el) {
        gameIDs.push(el.id)
      });

      socket.emit('check ID', { gameIDs });

      socket.on('games DB' , function (data) {
        self.scoreUpdate(data , gameIDs);
      });

      io('/' + gameID).on('score update' , function (data) {
        self.gameUpdates(data , gameID);
      })
      
    },
    scoreUpdate: function (data, clientIDs) {
      var games = data.games;
      var elem = document.querySelectorAll('.gameslist li a');

      for (var key in games) {
        // skip loop if the property is from prototype
        if (!games.hasOwnProperty(key)) continue;

        var gamesList = document.getElementById(games[key].gameID);
                
        gamesList.querySelector('.team1 h4 span').innerHTML = games[key].team_1.score;          
        gamesList.querySelector('.team2 h4 span').innerHTML = games[key].team_2.score;        

      }
    },
    gameUpdates: function (data) {
      console.log(data);
    }

  }

app.init()

})();