var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// The models for the database will be here.
var gamesSchema = new mongoose.Schema({
  // Schema's go here.
  gameID: { type: String, unique: true },
  team_1_score: Number,
  team_2_score: Number,
  team_1: {
    name: String,
    teamID: String
  },
  team_2: {
    name: String,
    teamID: String
  },
  startTime: Date,
  swissRoundId: String,
  swissRoundNumber: String,
  gameSite: String,
  tournamentID: String,
  tournamentStyle: String
})

module.exports = mongoose.model('Game' , gamesSchema);