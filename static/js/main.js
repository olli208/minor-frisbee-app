(function () {
  var scoreBoard = document.querySelectorAll('.game-scoreboard input');
  var scoreTeam1 = parseInt(document.getElementById('score-team1').value);
  var scoreTeam2 = parseInt(document.getElementById('score-team2').value);

  scoreBoard.forEach(function (el) {
    el.addEventListener('click', addScore);
  });

  function addScore (e) {
    if (e.target.type === 'button') {
      if (e.target.name === 'team1') {
        var newScore = ++scoreTeam1;
        scoreTeam1 = newScore;
        console.log('team1', scoreTeam1);
      }
      else if (e.target.name === 'team2') {
        var oldScore = parseInt(document.getElementById('score-team1').value);
        var newScore = ++scoreTeam2;
        scoreTeam2 = newScore;
        console.log('team2', scoreTeam2);
      }
    }
  }

})();
