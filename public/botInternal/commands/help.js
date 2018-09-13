const STRINGS = require('../../common/strings');


function addHelpCommand(bot, stats) {
    if (bot && typeof bot.hear === 'function') {
        bot.hear(/^help|^h/i, (payload, chat) => {
            // stats.track(message.user_id, { msg: message.body }, 'help');
            chat.say('Available commands:\n ' +
                'card (c) card_name [set_code] ; card_name [set_code]  -  shows image of the card (up to 10 per message) from desired set \n\n ' +
                'price (p) card_name [set_code]  -  shows TCG mid, MTGO, and StarCityGames prices  \n\n ' +
                'oracle (o)  card_name - shows oracle text of the card  \n\n ' +
                // 'HelpMe (hm) имя_карты - помогает вспомнить забытое имя карты, оддерживает русские и английские имена \n\n' +
                'legality (l) card_name - check legality of the card in most popular formats \n\n' +
                'printings (pr) card_name | page_number - shows printing of the card, up to  10 printings per page  \n\n' +
                'art (a) card_name [set_code] ; card_name [set_code]  -  shows art crop of the card (up to 10 card per message) from desired set\n\n  ' +
                'AdvancedSearch (as) search_query | page_number - search with https://scryfall.com/docs/reference ONLY FOR ADVANCED USERS, up to 10 results per page \n\n' +
                'PrintingLanguages (pl) card_name [set_code] - shows languages and card name in that language for desired set(if provided), supports all MTG languages \n\n' +
                'wiki (w) search_query -provides link to the first page from https://mtg.gamepedia.com for provides search_query\n\n' +
                'Example of the request: card dark confidant[rav] \n\n\n');
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addHelpCommand;
