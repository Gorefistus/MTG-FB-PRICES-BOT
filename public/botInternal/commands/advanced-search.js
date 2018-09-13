const Scry = require('scryfall-sdk');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');

function sendResults(chat, values, page) {
    if (chat && values.length > 0) {
        const pages = Math.ceil(values.length / 10);
        let results = '';
        if (page > 0 && page <= pages) {
            results = `This cards matches the criteria (Page: ${page}/${pages}):`;
            const startIndex = (page - 1) * 10;
            for (let i = startIndex; i < ((page - 1) * 10) + 10 && i < values.length; i++) {
                results = results + `\n ${values[i].name}`;
            }
        } else {
            results = `This cards matches the criteria (Page: 1/${pages}):`;
            for (let i = 0; i < 10 && i < values.length; i++) {
                results = results + `\n ${values[i].name}`;
            }
        }
        chat.say(results);
    } else {
        console.error('Error sending results');
    }
}


function addAdvancedSearchCommand(bot, stats) {
    if (bot && typeof bot.hear === 'function') {
        bot.hear(/(^advancedsearch[\s]|^as[\s])/i, (payload, chat) => {
            // stats.track(message.user_id, { msg: message.body }, 'as');
            //VK replaces quotes "" with &quot; characters, so we replace them back again
            let searchQuery = payload.message.text.match(/(^advancedsearch[\s]|^as[\s])(.*)/i)[2].replace(new RegExp('&quot;', 'g'), '"')
                .replace(new RegExp('&gt;', 'g'), '>')
                .replace(new RegExp('&lt;', 'g'), '<');
            let page = 0;
            if (searchQuery.split('|').length > 1) {
                const tempValue = searchQuery.split('|');
                searchQuery = tempValue[0];
                page = parseInt(tempValue[1], 10);
            }
            const cardEmitter = Scry.Cards.search(`${searchQuery}`);
            const resultArray = [];
            let alreadyFired = false;
            cardEmitter.on('data', data => {
                if (resultArray.length < 100) {
                    resultArray.push(data);
                } else {
                    cardEmitter.cancel();
                }
            });

            cardEmitter.on('error', (reason) => {
                console.log(reason);
                if (reason && reason.error && CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                    return chat.say(STRINGS.REQ_TIMEOUT);
                }
                return chat.say(STRINGS.CARD_NOT_FOUND);
            });

            cardEmitter.on('cancel', () => {
                if (!alreadyFired) {
                    alreadyFired = true;
                    sendResults(chat, resultArray, page);
                }
            });

            cardEmitter.on('end', () => {
                if (!alreadyFired) {
                    alreadyFired = true;
                    if (resultArray.length === 0) {
                        chat.say(STRINGS.CARD_NOT_FOUND);
                    } else {
                        sendResults(chat, resultArray, page);
                    }
                }
            });
        });
    }
}

module.exports = addAdvancedSearchCommand;
