var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// The models for the database will be here.
var swissSchema = new mongoose.Schema({
  // Schema's go here.
  team: {
    swissPoints: Number,
    teamName: String,
    teamID: String
  },
  swissRoundId: String
})

module.exports = mongoose.model('SwissStandings' , swissSchema);