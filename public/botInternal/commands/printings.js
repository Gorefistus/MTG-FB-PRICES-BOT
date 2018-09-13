const request = require('request-promise-native');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addPrintingsCommand(bot, stats) {
    if (bot && typeof bot.hear === 'function') {
        bot.hear(/^printings[\s]|^pr[\s]/i, (payload, chat) => {
            // stats.track(message.user_id, { msg: message.body }, 'pr');
            let pageName = 0;
            let cardName = payload.message.text.match(/(^printings[\s]|^pr[\s])(.*)/i)[2];
            if (cardName.split('|').length > 1) {
                const tempValue = cardName.split('|');
                cardName = tempValue[0];
                pageName = parseInt(tempValue[1], 10);
            }
            MISC.getMultiverseId(cardName)
                .then((cardObject) => {
                    request({
                        uri: cardObject.prints_search_uri,
                        json: true,
                    })
                        .then((printings) => {
                            let printingsString = '';
                            if (printings.data && printings.data.length > 10) {
                                const pages = Math.ceil(printings.data.length / 10);
                                if (pageName > 0 && pageName <= pages) {
                                    const startIndex = (pageName - 1) * 10;
                                    let endIndex = 0;
                                    for (let i = startIndex; i < ((pageName - 1) * 10) + 10 && i < printings.data.length; i++) {
                                        printingsString = `${printingsString}${printings.data[i].set_name} (${printings.data[i].set.toUpperCase()})\n`;
                                        endIndex = i;
                                    }
                                    const totalPrintingsShown = endIndex - startIndex + 1;
                                    printingsString = `${totalPrintingsShown} printings (Total: ${printings.data.length}) of ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} (Page ${pageName}/${pages}): \n${printingsString}`;
                                } else {
                                    printingsString =
                                        `10 printings (Total: ${printings.data.length}) of ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} (Page 1/${pages}):\n`;
                                    for (let i = 0; i < 10 && i < printings.data.length; i++) {
                                        printingsString =
                                            `${printingsString}${printings.data[i].set_name} (${printings.data[i].set.toUpperCase()})\n`;
                                    }
                                }
                            } else {
                                printingsString = `${printings.data.length} printings (Total: ${printings.data.length}) of ${cardObject.printed_name ? cardObject.printed_name : cardObject.name}: \n`;
                                for (let i = 0; i < 10 && i < printings.data.length; i++) {
                                    printingsString = `${printingsString}${printings.data[i].set_name} (${printings.data[i].set.toUpperCase()})\n`;
                                }
                            }
                            return chat.say(printingsString);
                        }, (reason) => {
                            if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                                return chat.say(STRINGS.REQ_TIMEOUT);
                            }
                            return chat.say(STRINGS.CARD_NOT_FOUND);
                        });
                }, (reason) => {
                    if (CONSTANTS.TIMEOUT_CODE === reason.error.code) {
                        return chat.say(STRINGS.REQ_TIMEOUT);
                    }
                    return chat.say(STRINGS.CARD_NOT_FOUND);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}

module.exports = addPrintingsCommand;
