(function () {
  "use strict"

  var app = {
    init: function() {
      score.add();
      flashMessage.close();
    }
  }

  var score = {
    add: function () {
      var self = this;

      if (document.getElementById('score-team1')) {
        var elem = document.querySelectorAll('.scoreboard input')
        
        for (var i = 0; i < elem.length; i++) {
          elem[i].addEventListener('click', self.update);
        };
      }
    },
    update: function (e) {
      var scoreBoard1 = document.getElementById('score-team1');
      var scoreBoard2 = document.getElementById('score-team2');
      var scoreTeam1 = parseInt(scoreBoard1.value);
      var scoreTeam2 = parseInt(scoreBoard2.value);

    if (e.target.type === 'button') {
      if (e.target.name === 'team1') {
        var newScore = ++scoreTeam1;
        scoreTeam1 = newScore;
        scoreBoard1.value = newScore;
      }
      else if (e.target.name === 'team2') {
        var newScore = ++scoreTeam2;
        scoreTeam2 = newScore;
        scoreBoard2.value = newScore;
      }
    }
  }
}

var flashMessage = {
  close: function() {
    var self = this;

    var elem = document.getElementsByClassName('close');
    
    for (var i = 0; i < elem.length; i++) {
      elem[i].addEventListener('click', function(e){
        e.target.parentNode.className += " closed";
      });
    };

  }
} 

app.init();

})();
