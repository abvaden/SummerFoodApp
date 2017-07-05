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

function geocode(address) {
    const baseURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    // const sampleAddress = '165 W 46th St New York'

    const requestURL = baseURL + address;
    return fetch(requestURL)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if (data.status !== "OK") {
            throw new Error('Location not found');
        }
        return data.results[0].geometry.location;
    })
    .catch(function(e) {
        console.error(e);
    });
}

function requestSummerFood(url) {
    // Make a call to the summer food end point
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


function validateLocation(location) {
    // Check to make sure that either address or geographic has a value and validate the values
    if (!location) {
        return false;
    }

    if ((!location.lat) || (!location.lng)) {
        return false;
    }

    if ((location.lat < 180 || location.lat > 180) || (location.lng < -180 || location.lng > 180)) {
        return false;
    }

    if ((location.lat == 0 && location.lng == 0)) {
        // If the location is 0,0 then a system somewhere failed
        return false;
    }
    return true;
}

// --------------- GetFoodLocations handler -----------
function getFoodLocations(request, callback) {
    // This intent has three slots Location, Address, and Radius
    try {
        var location = request.currentIntent.slots.Location;
        const address = request.currentIntent.slots.Address;
        var radius = request.currentIntent.slots.Radius;
        const source = request.invocationSource;

        if (!location) {
            // Need to get location
            if (address) {
                // If an address is given then we can use the address to lookup the location 
                geocode(address).then(function(geocodedLocation) {
                    location = geocodedLocation;
                });
            }
        }

        if (!radius) {
            // If radius does not have a value then use the default of 15000 (m)
            radius = 15000;
        }

        // To make a request to the food service program endpoint we need location and radius
        // check for them to make sure that we have everything we need
        if ((!radius || radius <= 0) || (validateLocation(location))) {
            callback(close(request.sessionAttributes, 'Fulfilled', 
            {
                contentType: 'PlainText',
                content: 'Sorry I need to know how far away you would like to search'
            }));
        } else if (validateLocation(location)) {
            callback(close(
                request.sessionAttributes,
                'Fulfilled',
                {
                  contentType: 'PlainText',
                  context: 'Sorry I could not identify your location'  
                }
            ));
        }

        // Make a request to the SummerFoodProgram database with the users location and distance

        callback(close(
            request.sessionAttributes, 
            'Fulfilled',
            { 
                contentType: 'PlainText', 
                content: `Sorry GetFoodLocations portion of the bot has not been developed yet` 
            }
        ));
    } catch (e) {
        console.log('Error occurred while fulfilling  GetFoodLocations intent : ' + e);
    }
    
}


function dispatch(intentRequest, callback) {
    try {
        console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

        const intentName = intentRequest.currentIntent.name;

        // Dispatch to your skill's intent handlers
        if (intentName === 'GetFoodLocations') {
            return getFoodLocations(intentRequest, callback);
        } else if (intentName === 'Help') {
            return help(intentRequest, callback);
        }
        throw new Error(`Intent with name ${intentName} not supported`);
    } catch (e) {
        console.log('Error while fulfilling intent : ' + e);
    }
    
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
        if (event.bot.name !== 'SummerFood') {
             callback('Invalid Bot Name');
        }

        // Make a call to the dispatcher function which will call the proper handler based 
        // on the input intent
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};