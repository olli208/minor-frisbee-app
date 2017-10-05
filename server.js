var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var compression = require('compression');
var diff = require('deep-diff').diff; 
var session = require('express-session');
var flash = require('connect-flash');
var helpers = require('./helpers');
var mongoose = require('mongoose');

var app = express();
var server = require('http').createServer(app);
global.io = require('socket.io')(server);  

require('dotenv').config(); // secret stuff

mongoose.connect(process.env.DATABASE)
mongoose.Promise = global.Promise;

mongoose.connection.on('error' , function (err) {
  console.log('Something went wrong with MONGODB ->' , err.message)
})

// My models ( ͡° ͜ʖ ͡°)
require('./models/Game');
require('./models/Chat');

// Setup and middleware
app.set('view engine' , 'ejs')
  .set('views' , path.join(__dirname, 'views'))
  .use(express.static('static'))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ 
    extended: false 
  }))
  .use(compression({
    threshold: 0, 
    filter: () => true}))
  .use(session({ 
    secret: 'zoGeheim', 
    resave: false, 
    saveUninitialized: true
  }))
  .use(flash());

app.use(function (req, res, next) {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  next();
})

// My Routes
app.use('/', require('./routes/index'));

// SOCKET Things here
io.on('connect', function (socket) {
  var Chat = mongoose.model('Chat');
  var Game = mongoose.model('Game');

  socket.on('chat message', function (data){
    var ns = io.of(`/${data.gameID}`);
    console.log(ns)

    var formatChat = {
      gameID: data.gameID,
      message: 
        {
          content: data.message,
          date:  data.date,
          time: data.time
        }
    }

    new Chat(formatChat)
      .save()
      .then(function (chat) {
        console.log('NEW MESSAGE');
        // ns.emit('new message', chat);
        io.emit('new message', chat);
      });
  });
  
  socket.on('check ID', function (data) {
    var games = Game.find({'gameID': { $in: data.gameIDs }});
    
    games
      .then(function (games) {
        var difference = diff(games, data); // Compare old with new data

        if (difference) {
          io.emit('games DB', { games });
        }
      })
      .catch(function (err) {
        console.log(`Could not find GAMES from DATABASE -> ${err}`)
      })
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

server.listen(process.env.PORT, function (){
    console.log('server is running on: ' + process.env.PORT);
})
