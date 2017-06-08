var express = require('express');
var session = require('express-session');
var path = require('path');
var querystring = require('querystring');
var bodyParser = require('body-parser');

var routes = require('./routes/index')

var app = express();

var http = require('http').createServer(app);

app.set('view engine' , 'ejs')
  .set('views' , path.join(__dirname, 'views'))
  .use(express.static('static'))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(session({ secret: 'superGeheim', resave: false, saveUninitialized: false}));

app.use('/', routes);

http.listen(process.env.PORT, function (){
    console.log('server is running on: ' + process.env.PORT);
});
