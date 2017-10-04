(function() {
  "use strict"

  var socket = io();

  var app = {
    init: function() {
      score.add();
      flashMessage.close();
      realTime.innit();
      navTabs.innit();
      compactView.innit();
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

      var elem = document.querySelectorAll('.game__detail');
      var gameIDs = [];

      elem.forEach(function (el) {
        gameIDs.push(el.id)
      });

      socket.emit('check ID', { gameIDs });

      socket.on('games DB' , function (data) {
        console.log(data)
        self.scoreUpdate(data , gameIDs);
      });
      
      if (document.querySelector('.game-chat')) {
        loginButton.innit()
        var gameID = document.querySelector('input[name="game_id"]').value;
        var chatID = document.querySelector('#game-chat' + gameID);
        var chatForm = chatID.querySelector('form');

        self.gameChat(gameID, chatID, chatForm);
      }
    },
    scoreUpdate: function (data, clientIDs) {
      var games = data.games;
      var elem = document.querySelectorAll('.gameslist li a');

      for (var key in games) {
        // skip loop if the property is from prototype
        if (!games.hasOwnProperty(key)) continue;

        var scorePage = document.querySelector(`.header-section--score .sc${games[key].gameID}`);
        var gamesList = document.querySelectorAll(`.x${games[key].gameID}`);


        if (scorePage) {
          // Update the score page
          scorePage.querySelector('.team1-score').innerHTML = games[key].team_1_score;
          scorePage.querySelector('.team2-score').innerHTML = games[key].team_2_score;
        } else if (gamesList) {
          gamesList.forEach(function (el) {
            // update score games overview
            el.querySelectorAll('.game-score .team1-score span').forEach( function(x) {
              x.innerHTML = games[key].team_1_score; 
            });
  
            el.querySelectorAll('.game-score .team2-score span').forEach( function(z) {
              z.innerHTML = games[key].team_2_score;   
            });          
          })
        }
 
      }
    },
    gameChat: function (gameID, chatID, chatForm) {
      chatForm.addEventListener('submit' , function(e) {
        e.preventDefault();        
        var date = new Date();

        var oldMessages = chatID.querySelector('ul');
        var messageBox = document.querySelector('input[type="text"]');
        var message = messageBox.value;

        var messageContent = {
          message,
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          gameID,
        }

        socket.emit('chat message' , messageContent );
           
        socket.on('new message' , function (data) {
          chatRoom.newMessage(chatID , oldMessages , data); 
        });

        messageBox.value = "";  
      });

    }
  }

  var chatRoom = {
    newMessage: function (chatID, oldMessages , data) {
      var newMessage = document.createElement('li');
      newMessage.className = 'chat-message boxshadow';
      newMessage.innerHTML = 
        '<p><b>' + data.message.time + '</b> ' + data.message.date + '</p>' +
        '<p>'+ data.message.content +'</p>';

      oldMessages.insertBefore(newMessage, oldMessages.childNodes[0]);
    }
  }  

  var loginButton = {
    innit: function() {
      var loginBtn = document.querySelector('.login-button');
      loginBtn.addEventListener('click' , function() {
        document.querySelector('.login-msg').classList.toggle('login-msg__hide');
      })
    }
  }

  var compactView = {
    innit: function () {
      var self = this;

      if (document.querySelector('.switch input')) {
        var viewToggle = document.querySelector('.switch input');
        viewToggle.addEventListener('click' , self.toggle)
      }

    },
    toggle: function() {  
      var elemCompact = document.querySelector('.gamelist__compact'); 
      var elemDetail = document.querySelector('.gamelist__detail');  
      var toggle = document.querySelector('.switch input'); 

      console.log(toggle.checked)
      if (toggle.checked === true) {
        elemCompact.classList.remove('hide');
        elemDetail.classList.add('hide');

      } else if (toggle.checked === false) {
        elemCompact.classList.add('hide');
        elemDetail.classList.remove('hide');

      }
    }
  }

  var navTabs = {
    innit: function() {
      var self = this;

      if (document.querySelector('.header-tabs')){
        var buttonPressed = document.querySelector('.header-tabs');
        buttonPressed.addEventListener('click' , self.toggle)
      }
      
    },
    toggle: function(e) {
      var swissStandings = document.querySelector('.swiss-standings');
      var games = document.querySelector('.team-games');

      if (e.target.textContent === 'Games') {
        swissStandings.classList.add('hide');
        games.classList.remove('hide');

        document.querySelector('.header-tabs_games').classList.add('active');
        document.querySelector('.header-tabs_rankings').classList.remove('active');
      } else if (e.target.textContent === 'RANKINGS') {
        games.classList.add('hide');
        swissStandings.classList.remove('hide');

        document.querySelector('.header-tabs_games').classList.remove('active');
        document.querySelector('.header-tabs_rankings').classList.add('active');
      }
    }
  }

app.init()

})();