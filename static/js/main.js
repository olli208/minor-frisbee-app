(function () {
  var scoreBoard = document.querySelectorAll('.game-scoreboard input');

  scoreBoard.forEach(function (el) {
    el.addEventListener('click', function(e){
      if (e.target.type === "button") {
        console.log(e.target, e.target.name);
      }
    })
  })

})();
