const request = require('request-promise-native');

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function addPrintingLanguagesCommand(bot, stats) {
    if (bot && typeof bot.hear === 'function') {
        bot.hear(/^printinglanguages[\s]|^pl[\s]/i, (payload, chat) => {
            // stats.track(message.user_id, { msg: message.body }, 'pl');
            let cardName = payload.message.text.match(/(^printinglanguages[\s]|^pl[\s])(.*)/i)[2];
            const setNameRegex =  payload.message.text.match(/(^printinglanguages[\s]|^pl[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }
            let cardObject;
            MISC.getMultiverseId(cardName, setCode, true)
                .then((card) => {
                    cardObject = card;
                    return request({
                        uri: encodeURI(`${CONSTANTS.SCRY_API_LINK}!"${card.name}"s:${card.set}&include_multilingual=true&unique=prints`),
                        json: true,
                    });
                })
                .then((printings) => {
                    if (printings.total_cards <= 0) {
                        return chat.say(STRINGS.ERR_NO_PRINTINGS);
                    }
                    let printingsLanguagesString = `Printed languages of  ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} [${cardObject.set_name}]:\n`;
                    const alreadyShownLanguages = [];
                    for (let printing of printings.data) {
                        if (!alreadyShownLanguages.includes(printing.lang)) {
                            alreadyShownLanguages.push(printing.lang);
                            printingsLanguagesString += `Language: ${MISC.getLanguageByLangCode(printing.lang)}. Card Name: ${printing.printed_name ? printing.printed_name : printing.name}\n`;
                        }
                    }
                    return chat.say(printingsLanguagesString);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addPrintingLanguagesCommand;
