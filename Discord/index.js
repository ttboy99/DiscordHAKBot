// Load up the discord.js library
const Discord = require("discord.js");

/*
 DISCORD.JS VERSION 11 CODE
*/

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
const path = require('path');
const fs = require('fs');

var List = require("collections/list");
var songs = new List();
let dispatcher;
// config.token contains the bot's token
// config.prefix contains the message prefix.
let welcomeChannel= null;
let spammessage = "penis";
let spamFunction;
let guild;
let olex;

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity(`VRPorn`);
  welcomeChannel = client.channels.cache.get('741927071206604821');
  guild = client.guilds.cache.get('663303394362130432');
  olex = guild.member('547755382253158411');
  renamerFunction = setInterval(function(){ renamer() }, 300000);
  loadSongs();

});
client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(!message.content.startsWith(config.prefix)) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  console.log(args);
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  if(command === "play"){
    if (message.member.voice.channel) {
      let currentSong = "songs/erik.mp3";
      let volume = 1;
      let bassboost = false;
      const connection = await message.member.voice.channel.join();

      if(args.includes("bassboost"))
      {
        bassboost = true;
        args.splice(args.indexOf("bassboosted"),1);
      }
      songs.forEach(function (song){
        if(args.includes(song)){
            currentSong = "songs/" + song;
          args.splice(args.indexOf(song),1);
          return;
        }

      });
      if(args[0] !== null)
      {
        if(!isNaN(args[0]))
        {
          if(args[0]>100)
              volume = 1;
          else
            volume = ((args[0] > 1) ? args[0] / 100 : args[0]);         
        }
        else{
          
        }
      }
      if(bassboost)
        volume *= 5000;
      dispatcher = connection.play(currentSong, {volume: volume});
      dispatcher.on('start', () => {
        console.log('audio.mp3 is now playing!');
      });
      dispatcher.on('finish', () => {
        console.log('audio.mp3 has finished playing!');
      });
      dispatcher.on('error', console.error);
    }
  }

  if (command === "stop"){
    if(dispatcher !== null)
        dispatcher.destroy();
  }
	if(command === "spam"){
		spammessage = args.join(" ");
		spamFunction = setInterval(function(){ spammer() }, 1000);
	}
	
	if(command === "stopspam"){
		clearInterval(spamFunction);
	}
});

function spammer() {
if(welcomeChannel!=null){
		welcomeChannel.send(spammessage);
	}
}

function renamer() {
    if(Math.floor(Math.random() * Math.floor(100)) <= 10)
    {
      olex.setNickname('Eva.Rolex');
    }
    else {
      olex.setNickname('Adam.Rolex');
    }
}

function loadSongs(){
  console.log("Loading songs...");
  fs.readdir(path.join(__dirname, 'songs'), function(err, files){
    if(err)
        return console.log(err);

    files.forEach(function(file) {
      songs.add(file);
      console.log("Found: " + file);
    });    
  });
  console.log("Done loading songs.");
}


client.login(config.token);