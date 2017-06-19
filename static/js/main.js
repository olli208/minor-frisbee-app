(function () {
  "use strict"

  function addScore () {
    if (document.getElementById('score-team1')) {
      document.querySelectorAll('.scoreboard input').forEach(function (el) {
        el.addEventListener('click', update);
      });
    }
  }

  function update (e) {
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

  addScore()

})();
