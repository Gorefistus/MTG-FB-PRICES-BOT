const BootBot = require('bootbot');
const botStarter = require('./botInternal/bot-config');
const http = require('http');

const bot = new BootBot({
    accessToken:  process.env.accessToken || 'place your token here',
    verifyToken: process.env.verifyToken || 'place your token here',
    appSecret: process.env.appSecret || 'place your token here',
});


setInterval(() => {
    console.log('PINGED YOURSELF');
    http.get('http://mtg-facebook-bot.herokuapp.com/');
}, 300000);


botStarter.startBot(bot);

