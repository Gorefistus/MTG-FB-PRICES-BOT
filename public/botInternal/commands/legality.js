const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addLegalityCommand(bot, stats) {
    if (bot && typeof bot.hear === 'function') {
        bot.hear(/^legality[\s]|^l[\s]/i, (payload, chat) =>  {
            // stats.track(message.user_id, { msg: message.body }, 'l');
            const cardName = payload.message.text.match(/(^legality[\s]|^l[\s])(.*)/i)[2];
            MISC.getMultiverseId(cardName).then((cardObject) => {
                chat.say(`Legality of  ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} in formats:\n 
        ${STRINGS.FORMAT_STANDARD}: ${MISC.getLegality(cardObject.legalities.standard)}
        ${STRINGS.FORMAT_MODERN}: ${MISC.getLegality(cardObject.legalities.modern)}
        ${STRINGS.FORMAT_LEGACY}: ${MISC.getLegality(cardObject.legalities.legacy)}
        ${STRINGS.FORMAT_PAUPER}: ${MISC.getLegality(cardObject.legalities.pauper)}
        ${STRINGS.FORMAT_PENNY}: ${MISC.getLegality(cardObject.legalities.penny)}
        ${STRINGS.FORMAT_COMMANDER}: ${MISC.getLegality(cardObject.legalities.commander)}
        ${STRINGS.FORMAT_MTGO_COMMANDER}: ${MISC.getLegality(cardObject.legalities['1v1'])}
        ${STRINGS.FORMAT_VINTAGE}: ${MISC.getLegality(cardObject.legalities.vintage)}`);
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


module.exports = addLegalityCommand;
