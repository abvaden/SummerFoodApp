// This source code is based on the order flowers blueprint from AWS
'use strict'
var http = require('http');

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

function makeGeocodeRequest(address, callback) {
    const requestURL = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address;
    const requestOptions = {
        hostname: requestURL,
        method: 'get'
    };
    http.get(requestURL, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);

                if (parsedData.status !== "OK") {
                    throw new Error('Location not found');
                }

                callback(parsedData.results[0].geometry.location);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

var stringifyQuery = function(query) {
    var queryString = '';
    for (var key in query) {
        if (key === 'geometry') {
            queryString += key + '=' + encodeURIComponent(JSON.stringify(query['geometry'])) + '&';
        } else {
            queryString += key + '=' + query[key] + '&';
        }
        
    }
    return queryString;
}
var makeQuery = function(location, distance) {
    var deltaLat = distance / 111000.0 / 2.0;
    var deltaLng = distance / Math.cos(location.lat * (Math.PI / 180)) / (111000.0 / 2.0);

    return {
        layerDefs: "dataSource",
        geometry: {
            xmin: location.lng - deltaLng,
            ymin: location.lat - deltaLat,
            xmax: location.lng + deltaLng,
            ymax: location.lat + deltaLat
        },
        geometryType: "esriGeometryEnvelope",
        returnGeometry: true,
        f: "json",
        spatialRel : "esriSpatialRelIntersects",
        inSR: 4326,
        outFields : "*",
        outSR : 4326,
        resultType : "tile"
        };
}
/**
 * Make a call to the summer food end point
 * @param {*} callback  
 */
function requestSummerFood(location, distance, callback) {
    
    const query = makeQuery(location, distance);

    const baseURLSummerFoodProgram = 'http://services1.arcgis.com/RLQu0rK7h4kbsBq5/ArcGIS/rest/services/Summer_Meal_Sites_2017/FeatureServer/0/query?';
    var requestURL = baseURLSummerFoodProgram + stringifyQuery(query);
    
    http.get(requestURL, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }

        if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                callback(parsedData);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
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
                console.log('Address given using reverse geocoding to determine location');

                // If an address is given then we can use the address to lookup the location 
                makeGeocodeRequest(address, (location) => {
                    request.currentIntent.slots.Location = location;
                    
                    // Reinvoke the function, not sure if this is the right thing to do
                    getFoodLocations(request, callback);
                });
                return;
            } else {
                console.log('Could not find enough slots to determine address requesting slot Address');
                callback(elicitSlot(
                    request.sessionAttributes, 
                    request.currentIntent.name, 
                    request.currentIntent.slots, 
                    'Address', 
                    {
                        contentType: 'PlainText',
                        content: 'No location for search provided please provide address'
                    }));
                return;
            }
        }

        if (!radius) {
            // If radius does not have a value then use the default of 15000 (m)
            radius = 15000;

            console.log('No radius given using 15000 (m) as default');
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

        console.log('Input parameters valid, requesting summer food locations with the following parameters');
        console.log('location : ' +  location);
        console.log('radius : ' + radius);

        requestSummerFood(location, radius, (locations) => {
            if (!locations) {
                // For some reason this call back is getting called when locations is null
                // if this happens then we don't want to do anything
                return;
            }

            if (locations.features == null) {
                console.log('Get food locations responded with out features');
                console.log(JSON.stringify(locations));
                return;
            }
            
            console.log('Get food locations responded with value');
            console.log(JSON.stringify(locations.features));

            var locationCount = locations.features.length;
            callback(close(
                request.sessionAttributes, 
                'Fulfilled',
                { 
                    contentType: 'PlainText', 
                    content: `I found a bunch of locations! I found ` + 
                        locationCount + ' to be exact' 
                }
            ));
        });

    } catch (e) {
        console.log('Error occurred while fulfilling  GetFoodLocations intent : ' + e);
        throw e;
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