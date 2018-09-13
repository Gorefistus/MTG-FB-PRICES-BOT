const BootBot = require('bootbot');
const botStarter = require('./botInternal/bot-config');
const path = require('path');
const express = require('express');
const http = require('http');

const bot = new BootBot({
    accessToken:  process.env.accessToken || 'place your token here',
    verifyToken: process.env.verifyToken || 'place your token here',
    appSecret: process.env.appSecret || 'place your token here',
});


// THIS IS JUST NEEDED SO HEROKU WON"T STOPP OUR APPLICATION
const app = express();
app.use(express.static(path.resolve(__dirname + '/static')));
app.listen(process.env.PORT || 5000);

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

setInterval(() => {
    console.log('PINGED YOURSELF');
    http.get('http://mtg-facebook-bot.herokuapp.com/');
}, 300000);


botStarter.startBot(bot);

