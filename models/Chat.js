var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// The models for the database will be here.
var chatSchema = new mongoose.Schema({
  // Schema's go here.
  gameID: { type: String, unique: false },
  message:
    {
      content: String,
      date: String,
      time: String  
    }
})

module.exports = mongoose.model('Chat' , chatSchema);