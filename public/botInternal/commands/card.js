const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


function downloadAndPostCardImage(chat, cards) {
    if (cards && cards.length > 0 && chat) {
        const cardImageArray = [];
        // generating array of Promises for us to resolve, we need to wait for all of them to post a message
        for (const card of cards) {
            // double faced cards have many images in them, we need to handle that
            if (card.image_uris === undefined && card.card_faces && card.card_faces.length > 0) {
                card.card_faces.forEach((face) => {
                    if (cardImageArray.length < 10) {
                        cardImageArray.push({ attachment: 'image', url: face.image_uris.normal });
                    }
                });
            } else if (cardImageArray.length < 10) {
                cardImageArray.push({ attachment: 'image', url: card.image_uris.normal });
            }
        }
        chat.say(cardImageArray);
    } else {
        console.error('Error uploading photos to FB');
    }
}


function addCardCommand(bot, stats) {
    if (bot && typeof bot.hear === 'function') {
        bot.hear(/^card[\s]|^c[\s]/i, (payload, chat) => {
            // stats.track(message.user_id, {msg: payload.message.text}, 'c');
            const cardNames = payload.message.text.match(/(^card[\s]|^c[\s])(.*)/i)[2];
            const splittedCardNames = cardNames.split(';');
            // make it no more than 10 cards

            if (splittedCardNames.length > 0) {
                const cardRequestPromisesArray = [];
                for (let i = 0; i < 10 && i < splittedCardNames.length; i++) {
                    const cardSetSplit = splittedCardNames[i].match(/(.*)\[(.{3,4})\]/i);
                    if (cardSetSplit !== null) {
                        cardRequestPromisesArray.push(MISC.getMultiverseId(cardSetSplit[1], cardSetSplit[2]));
                    } else {
                        cardRequestPromisesArray.push(MISC.getMultiverseId(splittedCardNames[i]));
                    }
                }
                Promise.all(cardRequestPromisesArray.map(MISC.promiseReflect))
                    .then((values) => {
                        const resolvedPromises = values.filter(value => value.status === 'resolved');
                        const rejectedPromises = values.filter(value => value.status === 'rejected');
                        downloadAndPostCardImage(chat, resolvedPromises.map(result => result.v));
                        let didRequestTimeout = false;
                        let didCardNotFound = false;
                        let processedArrayElements = 0;
                        rejectedPromises.forEach((rejected) => {
                            if (rejected.e && rejected.e.error && CONSTANTS.TIMEOUT_CODE === rejected.e.error.code) {
                                didRequestTimeout = true;
                            } else {
                                didCardNotFound = true;
                            }
                            // JS forEach doesn't provide an callback when all operations are done, so we improvise
                            processedArrayElements++;
                            if (processedArrayElements === rejectedPromises.length) {
                                if (didRequestTimeout) {
                                    return chat.say(STRINGS.REQ_TIMEOUT);
                                } else if (didCardNotFound) {
                                    return chat.say(STRINGS.CARD_NOT_FOUND);
                                }
                            }
                        });
                    }, (reason) => {
                        console.log(reason);
                    });
            }
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}

module.exports = addCardCommand;
