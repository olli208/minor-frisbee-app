var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// The models for the database will be here.
var gamesSchema = new mongoose.Schema({
  // Schema's go here.
  gameID: String,
  team_1: {
    score: Number,
    name: String,
    teamID: String
  },
  team_2: {
    score: Number,
    name: String,
    teamID: String
  },
  startTime: String,
  swissRoundId: String,
  gameSite: String

})

module.exports = mongoose.model('Games' , gamesSchema);