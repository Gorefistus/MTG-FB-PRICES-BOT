const BootBot = require('bootbot');
const botStarter = require('./botInternal/bot-config');

const bot = new BootBot({
    accessToken:  process.env.accessToken || 'place your token here',
    verifyToken: process.env.verifyToken || 'place your token here',
    appSecret: process.env.appSecret || 'place your token here',
});

botStarter.startBot(bot);

