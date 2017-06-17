var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// The models for the database will be here.
var gamesSchema = new mongoose.Schema({
  // Schema's go here.
  team1: {
    score: Number,
    teamName: String,
    teamID: String
  },
  team2: {
    score: Number,
    teamName: String,
    teamID: String
  },
  startTime: String,
  swissRoundId: String

})

module.exports = mongoose.model('Games' , gamesSchema);