const wiki = require('wikijs').default;

const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');


function addWikiCommand(bot, stats) {
    if (bot && typeof bot.hear === 'function') {
        bot.hear(/^wiki[\s]|^w[\s]/i, (payload, chat) => {
            // stats.track(message.user_id, { msg: message.body }, 'w');
            const searchQuery = payload.message.text.match(/(^wiki[\s]|^w[\s]])(.*)/i)[2];
            wiki({
                apiUrl: CONSTANTS.WIKI_LINK,
                origin: null,
            })
                .search(searchQuery)
                .then((res) => {
                    if (res && res.results.length > 0) {
                        return wiki({
                            apiUrl: CONSTANTS.WIKI_LINK,
                            origin: null,
                        })
                            .page(res.results[0]);
                    }
                    // throwing error
                    throw false;
                })
                .then((page) => {
                    chat.say(`${STRINGS.WIKI_PAGE_LINK}\n${page.raw.canonicalurl ? page.raw.canonicalurl : page.raw.fullurl}`);
                })
                .catch(() => chat.say(STRINGS.ERR_NO_WIKI_PAGE));
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addWikiCommand;
