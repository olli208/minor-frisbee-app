var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// The models for the database will be here.
var teamsSchema = new mongoose.Schema({
  // Schema's go here.
  teamID: {type: String, unique: true},
  swissRoundId: String,
  swiss: {
    swissRoundId: String,
    score: Number,
  },
  games: [String]
})

module.exports = mongoose.model('Team' , teamsSchema);