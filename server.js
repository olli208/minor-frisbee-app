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
  console.log(socket.id);

  socket.on('chat message', function(data){
    var date = new Date()
    var Chat = mongoose.model('Chat');

    var formatChat = {
      gameID: data.gameID,
      message: 
        {
          content: data.message,
          date:  date.toLocaleDateString(),
          time: date.toLocaleTimeString()
        }
    }

    new Chat(formatChat)
      .save()
      .then(function () {
        console.log('SUCCESS!! NEW CHAT MESSAGES ADDED!');

        var chatRoom = Chat.find({'gameID': data.gameID });
        
        chatRoom
          .then(function (chat) {
            var messages = [];
            chat.forEach(function (e) {
              messages.push(e);
            })

            console.log(messages)

            var ns = io.of(`/${data.gameID}`);
            ns.emit('new message', {messages});

          })
          .catch(function (err) {
            console.log(`FINDING MESSAGES FROM DB ERROR -> ${err}`)
          })

      })
      .catch(function (err) {
        console.log(`ADDING MESSAGES TO DB ERROR -> ${err}`)
      })

  });
  
  socket.on('check ID', function (data) {
    var games = mongoose.model('Game').find({'gameID': { $in: data.gameIDs }});
    
    games
      .then(function (games) {
        io.emit('games DB', { games });

      })
      .catch(function (err) {
        console.log(`Could not find GAMES from DATABASE -> ${err}`)
      })
  });

});

server.listen(process.env.PORT, function (){
    console.log('server is running on: ' + process.env.PORT);
});
