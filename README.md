# ultimate frisbee app

## [LINK (WIP)*](https://shielded-fortress-32511.herokuapp.com/)
###### \* The scores on the overview page and the update page are different. The tournament is already over so technically you can't update them anymore.

## About
This is an app for keeping the score in Windmill, an ultimate frisbee tournament in Amsterdam. Teams can use this app to update their scores, see their matches, and publish the end results of their match. People can see an overview of games during the [Windmill Tournament](http://windmilltournament.com). Using this app users can log in to Leaguevine to update scores directly from within the app.

### User Stories 
- As as user I want to see an overview of the games that are going on.
- As a user I want to be able to update the score of a game.
- As a user I want to see more information about a team.

### Concept
The core of the app is updating the score of games. Right now at Windmill tournaments, it's done by volunteers that are keeping track of each game. After the game, they have to travel (sometimes by bike!) to the one person who will update the scores on the site to Leaguevine.

After beeing there myself as a complete "Ultimate Frisbee Noob", I had ideas on how to improve the experience for people who don't know the teams, but want to see exiting games. Luckily Leaguevine gives people the option to keep track of Swiss Points. What are Swiss Points? [HERE](https://www.leaguevine.com/blog/134/power-rankings-in-ultimate/) is a link that explains what is exactly. The TL:DR is that you can realy see what teams are performing the best at a tournament, thanks to handy algorithms that gives and removes Swiss Points depending on performance against each other.

Within the app you are able to see the current rankings. From there you will be able to click on a team and see their games played and games they are playing next.

### Features
With the app you can see who, where, which round, the teams are playing. You can see the current score and see the Swiss Standings from within the app. You can see each team page to learn a bit more about them, like where they are from, their form, games etc.

Besides updating the score of a game, user can see the power rankings from within the app. When a user visits the page, all games are loaded based on the current time. There are alot of games during the tournament, so each tournament division has their own page with power rankings. So you have the page for Womens, Open, and Mixed. 

When the tournament is live and you use the app, it loads the games based on the time and date, so users are getting the most current games. These games are send to my own database, so when a user visits a team page, the games that they already played can be loaded from the database. Therefore the user doesn't have to make a new request for data that we already have loaded.

There is a real time aspect to the app when users updates a score, users don't need to refresh the games overview page. Using [websockets](https://socket.io/) we are able to update in realtime the scores in the app. 

The app is made with node.js, with a few clientside javascript enhancements.

## Flow of the app
![flowchart](readme/ultimate-frisbee-flowchart.png)

### Tools
This is a nodejs app using express. MongoDB is used for storing games. The app is using data from Leaguevine API. Below are the packages I use:
```
    "body-parser": "^1.17.2",
    "compression": "^1.6.2",
    "connect-flash": "^0.1.1",
    "dotenv": "^4.0.0",
    "ejs": "^2.5.6",
    "express": "^4.15.2",
    "express-session": "^1.15.3",
    "moment": "^2.18.1",
    "mongoose": "^4.10.6",
    "querystring": "~0.2.0",
    "request": "~2.34.0",
    "request-promise": "^4.2.1",
    "socket.io": "1.7.3",
    "body-parser": "^1.17.2",
```

### Other Stuff
Since I'm using a test environment for the API (playwithlv) I have to get data from Windmill 2015, since that is the most updated one. This is a prototype and alot of things can and will be worked on as I learn new techniques. All the request you would make with leaguevine can be done if you change the url. For example:
`https://api.leaguevine.com/v1/games/?team_ids=(TEAMIDS)&access_token=(ACCESSTOKEN)`
becomes:
`http://api.playwithlv.com/v1/games/?team_ids=(TEAMIDS)&access_token=(ACCESSTOKEN)`

### Courses implemented from the minor
- CSS To The Resque.
Using some new CSS features like flexbox. Trieed to do some experimental stuff like CSS snap points but that seems to be only supported in Frefox and partly by Safari.

- Performance matters.
Built 90% with node.js and added offline message, when there is no connection. Implemented mongoDB to reduce stress to API.

- Web App From Scratch.
Although it's 90% node.js the client side JavaScript is writen in the way we learned it, object oriented.

- Real-Tim Web.
The app utilises websockets to give the user realtime updates when a team scores.

## Install the app
To see it live and go trough the Oauth flow your self clone this repo, run the following command in the terminal
```
git clone
```

From the root of the directory run
```
npm install
```

Then add these to the server.js file in the root of the project. You can get them [here (leaguevine)](https://www.leaguevine.com/docs/api/) for regular leaguevine or [here (playwithlv)[(http://www.playwithlv.com/docs/api/) for developement. The latter one is recommended for this app for now. If you want to use the database contact me so I can give you my username and password (It's not neccesary for the core of the app to work, so dont worry if you don't have it).
```
var client_id = (your client id)
var client_secret = (your client secret)
REDIRECT_URI = "http://localhost:8000/callback"
PORT=8000
FAKE_DATE=2015-06-12T08:00:00.427144+02:00 
DATABASE=mongodb://(USERNAME):(PASSWORD)@ds129342.mlab.com:29342/windmill-frisbee

```
###### \* You can change the 'FAKE_DATE' to experiment with the time to see which games you get.

Then
```
npm start
```

Now you can see the app for your self and test it out. This app uses a different url for the API for testing purposes, so we dont overload the leaguevine servers with requests.


### [TO DO](https://github.com/olli208/minor-frisbee-app/projects/1)


## source
- [Swiss Pairing](http://senseis.xmp.net/?SwissPairing)
- [Windmill Tournament Rules & Format](http://windmilltournament.com/tournament-info/rules-and-format/)
- [Power Rankings](https://www.leaguevine.com/blog/134/power-rankings-in-ultimate/)
- [Learn Node by Wes Bos](http://wesbos.com/learn-node/)
