(function() {
  "use strict"

  var socket = io();

  var app = {
    init: function() {
      preventFormSubmit.innit();
      score.add();
      flashMessage.close();
      realTime.innit();
    }
  }

  var preventFormSubmit = {
    innit: function () {
      if (document.querySelector('input[type="submit"]')) {
        // document.querySelector('input[type="submit"]').addEventListener('click' , function (e) {
        //   console.log(e)
        //   e.preventDefault();
        // })
      }      
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
    innit: function() {  
      var self = this;

      if (document.querySelector('.game')) {
        var elem = document.querySelectorAll('.game');
        var gameIDs = [];
  
        elem.forEach(function (el) {
          gameIDs.push(el.id)
        });
  
        socket.emit('check ID', { gameIDs });
  
        socket.on('games DB' , function (data) {
          self.scoreUpdate(data , gameIDs);
        });
      }  
      
      if (document.querySelector('.game-chat')) {
        self.gameChat(document.querySelector('input[name="game_id"]').value)
      }
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
    gameChat: function (gameID) {
      var chatID = document.querySelector('#game-chat' + gameID);
      var chatForm = chatID.querySelector('form');

      chatForm.addEventListener('submit' , function(e) {
        var messageBox = document.querySelector('input[type="text"]');

        socket.emit('chat message' , {
          message: messageBox.value,
          gameID
        });

        messageBox.value = "";  
        e.preventDefault();
      })

      io('/' + gameID).on('new message' , function (msg) {
        console.log(msg);

        var messages = chatID.querySelector('ul');
        var message = document.createElement('li');

        message.className = 'chat-message';
        message.innerHTML = '<p>'+ msg +'</p>';

        messages.appendChild(message);
      })

    }
  }

app.init()

})();