const request = require('request-promise-native');
const phantom = require('phantom');
const path = require('path');
const fs = require('fs');

const CARD_CACHE = require('../../common/CardCache');
const STRINGS = require('../../common/strings');
const CONSTANTS = require('../../common/constants');
const MISC = require('../../common/misc');


async function getCardPrices(parsedCardName, setCode) {
    let priceString = '';

    const cardObject = await MISC.getMultiverseId(parsedCardName, setCode);
    priceString = `Price for ${cardObject.printed_name ? cardObject.printed_name : cardObject.name} [${cardObject.set_name}]:\n TCG Mid: ${cardObject.usd ? `$${cardObject.usd}` : STRINGS.NO_DATA}\n MTGO: ${cardObject.tix ? `${cardObject.tix} tix` : STRINGS.NO_DATA}`;

    let cardName = cardObject.name;
    if (cardObject.card_faces) {
        cardName = cardObject.name.split('//')[0].trim();
    }

    // let image;
    // try {
    //     const instance = await phantom.create();
    //     const page = await instance.createPage();
    //     await page.on('onResourceRequested', function (requestData) {
    //         console.info('Requesting', requestData.url);
    //     });
    //     const cardNameUrl = MISC.replaceAll(MISC.removeAllSymbols(cardName, [',', `'`]), ' ', '+');
    //     const cardSetUrl = MISC.replaceAll(MISC.removeAllSymbols(cardObject.set_name, [',', `'`]), ' ', '+');
    //
    //     const url = `${CONSTANTS.MTGGOLDFISH_PRICE_LINK}${cardSetUrl}/${cardNameUrl}#paper`;
    //
    //     const status = await page.open(url);
    //     const clipRect = await page.evaluate(function () {
    //         return document.querySelector('#tab-paper')
    //             .getBoundingClientRect();
    //     });
    //     page.property('clipRect', {
    //         top: clipRect.top,
    //         left: clipRect.left,
    //         width: clipRect.width,
    //         height: clipRect.height,
    //     });
    //
    //     const imageName = `${cardObject.set_name}${cardObject.name}${Date.now()}.png`;
    //     page.render(imageName);
    //     await instance.exit();
    //     image = await bot.uploadPhoto(path.resolve(imageName));
    //     fs.unlink(imageName, () => {
    //         console.log(STRINGS.LOG_FILE_DELETED);
    //     });
    // } catch (e) {
    //     //do nothing
    // }

    // SCG PRICES SCRAPING START
    let scgPriceObject = CARD_CACHE.getCardFromCache(cardObject, false);

    if (scgPriceObject) {
        priceString = `${priceString} \n SCG: ${scgPriceObject.value}`;
    } else {
        try {
            const starCityPage = await request(`${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`);
            scgPriceObject = MISC.getStarCityPrice(starCityPage, cardObject);
            if (false) {
                CARD_CACHE.addCardToCache({
                    ...scgPriceObject,
                    name: cardObject.name,
                    foil: false,
                });
                priceString =
                    `${priceString} \n SCG:${scgPriceObject.set !== cardObject.set_name ? ` [${scgPriceObject.set}] ` : ''} ${scgPriceObject.value}`;
            } else {
                priceString = `${priceString} \n SCG: ${CONSTANTS.STAR_CITY_PRICE_LINK}${encodeURIComponent(cardName)}&auto=Y`;
            }
        } catch (e) {
            console.error('SCG REQUEST ERROR\n', e);
            priceString = `${priceString} \n SCG: ${STRINGS.PRICE_ERROR}`;
        }
    }
    return priceString;

}


function addPriceCommand(bot, stats) {
    if (bot && typeof bot.hear === 'function') {

        bot.hear(/^price[\s]|^p[\s]/i, (payload, chat) => {
            // stats.track(message.user_id, { msg: message.body }, 'p');
            let cardName = payload.message.text.match(/(^price[\s]|^p[\s])(.*)/i)[2];
            const setNameRegex = payload.message.text.match(/(^price[\s]|^p[\s])(.*)\[(.{3,4})\]/i);
            const setCode = setNameRegex !== null ? setNameRegex[3] : undefined;
            if (setCode) {
                cardName = setNameRegex[2];
            }

            getCardPrices(cardName, setCode)
                .then((prices) => {
                    chat.say(prices);
                }, (reason) => {
                    if (reason && reason.statusCode && reason.statusCode === 404) {
                        return chat.say(STRINGS.CARD_NOT_FOUND);
                    } else {
                        return chat.say(STRINGS.PRICES_ERR_GENERAL);
                    }
                })
                .catch(() => {
                    return chat.say(STRINGS.PRICES_ERR_GENERAL);
                });
        });
    } else {
        console.error(STRINGS.COMMAND_NOT_ADDED);
    }
}


module.exports = addPriceCommand;
