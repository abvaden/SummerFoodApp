// This source code is based on the order flowers blueprint from AWS
'use strict'

 // --------------- Helpers to build responses which match the structure of the necessary dialog actions -----------------------
function elicitSlot(sessionAttributes, intentName, slots, slotToElicit, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            intentName,
            slots,
            slotToElicit,
            message,
        },
    };
}

function close(sessionAttributes, fulfillmentState, message) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}

function delegate(sessionAttributes, slots) {
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots,
        },
    };
}



// --------------- Help handler -----------------------
function help(request, callback) {
    callback(close(
        intentRequest.sessionAttributes, 
        'Fulfilled',
        { 
            contentType: 'PlainText', 
            content: `Sorry the help portion of the bot has not been developed yet` 
        }
    ));
}


function validateLocation(address, geographic) {
    // Check to make sure that either address or geographic has a value and validate the values
}

// --------------- GetFoodLocations handler -----------
function getFoodLocations(request, callback) {
    // This intent has three slots Location, Address, and Radius

    const location = intentRequest.currentIntent.slots.Location;
    const address = intentRequest.currentIntent.slots.Address;
    const radius = intentRequest.currentIntent.slots.Radius;
    const source = intentRequest.invocationSource;

    callback(close(
        intentRequest.sessionAttributes, 
        'Fulfilled',
        { 
            contentType: 'PlainText', 
            content: `Sorry GetFoodLocations portion of the bot has not been developed yet` 
        }
    ));
}


function dispatch(intentRequest, callback) {
    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const intentName = intentRequest.currentIntent.name;

    // Dispatch to your skill's intent handlers
    if (intentName === 'GetFoodLocations') {
        return getFoodLocations(intentRequest, callback);
    } else if (intentName === 'Help') {
        return help(intentRequest, callback);
    }
    throw new Error(`Intent with name ${intentName} not supported`);
}

// --------------- Main handler -----------------------
// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        // By default, treat the user request as coming from the America/New_York time zone.
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        // We first check the bot name as to not have this function invoked by other bots
        if (event.bot.name !== 'OrderFlowers') {
             callback('Invalid Bot Name');
        }

        // Make a call to the dispatcher function which will call the proper handler based 
        // on the input intent
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};