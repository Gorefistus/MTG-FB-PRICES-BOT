const STRINGS = require('../../common/strings');


function addMiscCommands(bot, stats) {
    if (bot && typeof bot.hear === 'function') {

        // bot.on('command-notfound', (msg) => {
        //     stats.track(msg.user_id, { msg: msg.body }, 'uc');
        //     bot.send(STRINGS.COMMAND_NOT_FOUND, msg.peer_id);
        // });

        bot.on('message', (payload, chat) => {
            chat.say(STRINGS.COMMAND_NOT_FOUND);

        });

    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addMiscCommands;
