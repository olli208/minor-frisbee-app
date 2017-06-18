var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// The models for the database will be here.
var teamsSchema = new mongoose.Schema({
  // Schema's go here.
  team1: {
    score: Number,
    teamName: String,
    teamID: String
  },
  games: [String],
  swissRoundId: String
})

module.exports = mongoose.model('Teams' , teamsSchema);