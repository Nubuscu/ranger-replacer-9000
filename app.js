const request = require('request');
const Discord = require('discord.js');
const client = new Discord.Client();

//import data from the config file
const {prefix, token, channelId} = require('./config');

client.login(token);

let channel;

//just some old date so it gets everything on it's first run
let lastRun = new Date("December 17, 1995 03:24:00").getMilliseconds();

client.on('ready', () => {
  console.log('ready!');
  let guilds = client.guilds;
  //list all servers it's connected to
  guilds.forEach((g) => {
    console.log(g.name);
  });
  channel = client.channels.find("id", channelId);
});

/**
 * reads messages in chat and responds if they match formatting
 * e.g. ##ping --> pong
 */
client.on("message", message => {
  if (message.content === prefix + 'ping') {
    message.channel.send('pong');
  }
});

/**
 * makes a request to the new section of r/GameDeals and filters the results
 * for free things. These are then compiled into a string and sent to the
 * discord channel provided
 */
function getRedditPosts() {
  //adding .json to the end of a reddit url (conveniently) converts it to json
  //not sure if the ?count param works
  request.get('https://www.reddit.com/r/GameDeals/new/.json?count=100',
      function (error, response, body) {
        if (error) {
          console.log('error:', error);
        }
        //if you're trying this with a different domain,
        //I'd recommend pretty printing the resulting json to see the structure
        //or use postman or restlet or something like that
        let results = JSON.parse(body).data.children;
        let message = "free stuff:\n";
        let things = "";

        for (let x in results) {
          let title = results[x].data.title.toLowerCase();
          let url = results[x].data.url;
          let timePosted = results[x].data.created * 1000; //shift to millisecond timestamp
          if ((title.includes("free") || title.includes("100"))
              && timePosted > lastRun) { //look for free or 100% off titles
            things += title + ": " + url + "\n";
          }
        }
        //sends results if there are any
        if (things !== "") {
          channel.send(message + things);
        } else {
          channel.send("nothing to report");
        }
        lastRun = Date.now();
        console.log(lastRun);
      });
}

//sets the getRedditPosts function to run every x milliseconds
let interval = setInterval(getRedditPosts, 4.32e+7); //12 hours
