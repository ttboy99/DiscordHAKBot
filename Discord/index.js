const Discord = require("discord.js");
const client = new Discord.Client();

const config = require("./config.json");
const path = require('path');
const fs = require('fs');

var List = require("collections/list");
var songs = new List();
let dispatcher;

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
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  if(message.author.bot) return;

  if(!message.content.startsWith(config.prefix)) return;
  

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  console.log("Command: " + command + " with " + args);

  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
   const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{}); 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
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
        args.splice(args.indexOf("bassboost"),1);
      }
      
      args.forEach(function (arg){
        if(!isNaN(arg))
          {
          if(arg>100)
              volume = 1;
          else
            volume = ((arg > 1) ? arg / 100 : arg); 
            args.splice(args.indexOf(arg),1);        
          }
      });

      songs.forEach(function (song){      
        if(args.includes(song)){
            currentSong = "songs/" + song;
          args.splice(args.indexOf(song),1);
          return;
        }

      });
      
      if(bassboost)
        volume *= 5000;
      dispatcher = connection.play(currentSong, {volume: volume});
      dispatcher.on('start', () => {
        console.log(currentSong + ' is now playing!');
      });
      dispatcher.on('finish', () => {
        console.log(currentSong + ' has finished playing!');
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