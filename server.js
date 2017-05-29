var express = require('express');
var app = express();
var session = require('express-session');

// Socket requires
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var path = require('path');
var request = require('request'); // simple API requests
var rp = require('request-promise'); // request promise thingy
var querystring = require('querystring');
var cookieParser = require('cookie-parser'); //parses cookier (? from spotify)
var dotenv = require('dotenv').config(); //secret stuff
var diff = require('deep-diff').diff; // compare objects

var client_id = process.env.CLIENT_ID
var client_secret = process.env.CLIENT_SECRET
var redirect_uri = 'http://localhost:8888/callback'; // For local testing !!


app.set('view engine' , 'ejs')
    .set('views' , path.join(__dirname, 'views'))
    .use(express.static('static'))
    .use(cookieParser())
    .use(session({
        secret: 'superGeheim',
        resave: false,
        saveUninitialized: true
    }));

var access_token,
    refresh_token;

io.on('connect', onConnect);
app.get('/', index);
app.get('/login', login);
app.get('/callback', callback);

function index(req , res) {

}

function login(req, res){

}

function callback(req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {

        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        // Get acces and refresh okens from Spotify
        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                access_token = body.access_token;
                refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // get user id
                rp(options).then(function(body){playlistOwner = body.id});

                res.redirect('/playlists');
            } else {
                // unless there's an error...
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
}

// SOCKET THINGIESS HERE
function onConnect(socket) {

}

var port = process.env.PORT || 8888;

http.listen(port, function (){
    console.log('server is running: on: ' + port);
});
