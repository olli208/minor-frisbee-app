# ultimate frisbee app


## About
This is an app for keeping the score in Windmill, an ultimate frisbee tournament in Amsterdam. Teams can use this app to update their scores, see their matches, and publish the end results of their match. People can see an overview of games during the [Windmill Tournament](http://windmilltournament.com). Using this app users can log in to Leaguevine to update scores directly from within the app.

### Concept
The core of the app is updating the score of games. Right now at Windmill tournaments, it's done by volunteers that are keeping track of each game. After the game, they have to travel (sometimes by bike!) to the one person who will update the scores on the site to Leaguevine.

After beeing there myself as a complete "Ultimate Frisbee Noob", I had ideas on how to improve the experience for people who don't know the teams, but want to see exiting games. Luckily Leaguevine gives people the option to keep track of Swiss Points. What are Swiss Points? [HERE](https://www.leaguevine.com/blog/134/power-rankings-in-ultimate/) is a link that explains what is exactly. The TL:DR is that you can realy see what teams are performing the best at a tournament, thanks to handy algorithms that gives and removes Swiss Points depending on performance against each other.

### Features
With the app you can see who, where, which round, the teams are playing. You can see the current score and see the Swiss Standings from within the app. You can see each team page to learn a bit more about them, like where they are from, their form, etc.

Besides updating the score of a game, user can see the power rankings from within the app. When a user visits the page, all games are loaded based on the current time. There are alot of games during the tournament, so each tournament division has their own page with power rankings. So you have the page for Womens, Open, and Mixed. 

## Install the app
To see it live and go trough the Oauth flow your self clone this repo, run the following command in the terminal
```
git clone
```

From the root of the directory run
```
npm install
```

Then add these to the server.js file in the root of the project. You can get them [here](https://www.leaguevine.com/docs/api/)
```
var client_id = (your client id)
var client_secret = (your client secret)
REDIRECT_URI = "http://localhost:8000/callback"
PORT = 8000
```

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
