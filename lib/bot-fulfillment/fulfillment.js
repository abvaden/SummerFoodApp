// This source code is based on the order flowers blueprint from AWS
'use strict'
var http = require('http');

import {SelectMealRequest} from './select-meal-fulfillment';
import {elicitSlot, close, delegate} from './helper-functions';
import {generateRequest} from './request-factory';
import {requestSummerFoodLocations} from '../api-calls/summer-food-service-program-api-call';
import {reverseGeocode, validateLocation} from '../api-calls/reverse-geocode';



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

function handleSelectMealRequest(selectMealRequest, callback) {
    console.log('Handle select meal request called');

    let lexRequest = selectMealRequest.getRequest();
    
    // If there are any validation errors with the request 
    // we assume that we need to elicit a slot from the user
    // this will be called multiple times until there are no 
    // more validation errors
    selectMealRequest.ValidateMeals();
    if (!selectMealRequest.getMealsFilterValid()) {
        let validationError = selectMealRequest.ValidateMeals()[0];
        
        if (lexRequest.bot.version === "$LATEST") {
            console.log('Select meal request submitted with' + 
            ' meal filter validation errors : +' + JSON.stringify(validationError));
        }
        const response = elicitSlot(
            lexRequest.sessionAttributes, 
            lexRequest.currentIntent.name, 
            lexRequest.currentIntent.slots, 
            validationError.SlotName,
            { contentType: 'PlainText', content: validationError.Message});
        callback(response);
        return;
    }
    if (lexRequest.sessionAttributes == null) {
        lexRequest.sessionAttributes = {};
    }
    lexRequest.sessionAttributes.MealFilter = '';
    if (selectMealRequest.getBreakfast()) {
        lexRequest.sessionAttributes.MealFilter += 'Breakfast,';
    }
    if (selectMealRequest.getLunch()) {
        lexRequest.sessionAttributes.MealFilter += 'Lunch,';
    }
    if (selectMealRequest.getSnack()) {
        lexRequest.sessionAttributes.MealFilter += 'Snack,';
    }
    if (selectMealRequest.getDinner()) {
        lexRequest.sessionAttributes.MealFilter += 'Dinner,';
    }
    if (selectMealRequest.getAny()) {
        lexRequest.sessionAttributes.MealFilter += 'Any';
    }

    // If we are passed the meals filter potion and have valid meal filter 
    // at this point we need to get the users address so we will pass the 
    // location valid portion
    selectMealRequest.ValidateLocation();
    if (!selectMealRequest.getLocationValidated()){
        let validationError = selectMealRequest.ValidateLocation()[0];

        if (lexRequest.bot.version === "$LATEST") {
            console.log('Select meal request submitted with' + 
            ' location validation errors : +' + JSON.stringify(validationError));
        }
        const response = elicitSlot(
            lexRequest.sessionAttributes, 
            lexRequest.currentIntent.name, 
            lexRequest.currentIntent.slots, 
            validationError.SlotName,
            { contentType: 'PlainText', content: validationError.Message});
        callback(response);
        return;
    }

    // Once this point is reached we have a valid meal filter and we have a valid
    // location so we will now query the SummerFoodServiceProgram api end point
    let reverseGeocodeCallback = (location) => {
        // Make sure the returned location can be validated
        if (validateLocation(location)) {
            console.log('Error while validating location returned from reverse ' + 
            'geocoding : ' + JSON.stringify(location));


            var response = close(
                lexRequest.sessionAttributes,
                'Fulfilled',
                {
                    contentType: 'PlainText', 
                    content: 'error while geocoding the response'
                });
            callback(response);
        }
        
        lexRequest.sessionAttributes.Location = location;
        lexRequest.sessionAttributes.Address = selectMealRequest.getAddress();

        let summerFoodLocationCallback = (foodResults) => {
            // need to set some session attributes here
            lexRequest.sessionAttributes.FoodLocations = foodResults;

            let response = close(
                lexRequest.sessionAttributes,
                'Fulfilled',
                {
                    contentType: 'PlainText', 
                    content: 'finished getting locations'
                });

                console.log(JSON.stringify(lexRequest));
                close(response);
        };

        if (lexRequest.bot.version === "$LATEST") {
            console.log('reverse geocoding successful : ' + JSON.stringify(location));
        }

        requestSummerFoodLocations(
            location, 
            selectMealRequest.getRadius(), 
            summerFoodLocationCallback);
    };
    reverseGeocode(
        selectMealRequest.getAddress(),
        reverseGeocodeCallback
    );
}

function dispatch(lexRequest, callback) {
    try {
        if (lexRequest.bot.version === "$LATEST") {
            console.log(`dispatch userId=${lexRequest.userId}, intentName=${lexRequest.currentIntent.name}`);    
        }
        
        const request = generateRequest(lexRequest);

        if (request.INTENT_NAME === 'MealSelect') {
            handleSelectMealRequest(request, callback);
        } else if (request.INTENT_NAME === 'Help') {
            throw new Error('not implemented');
        } else if (request.INTENT_NAME === 'GetFoodLocations') {
            throw new Error('not implemented');
        } else {
            throw new Error('not implemented');
        }
    } catch (e) {
        console.log('Error while fulfilling intent : ' + e);
    }
    
}

// --------------- Main handler -----------------------
// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
export function handler(event, context, callback) {
    try {
        // By default, treat the user request as coming from the America/New_York time zone.
        process.env.TZ = 'America/New_York';
        console.log(`event.bot.name=${event.bot.name}`);

        // We first check the bot name as to not have this function invoked by other bots
        if (event.bot.name !== 'SummerFood') {
             callback('Invalid Bot Name');
        }

        if (event.bot.version === "$LATEST") {
            // General dev logs
            var requestString = JSON.stringify(event);
            var contextString = JSON.stringify(context);
            console.log('Called with request : ' + requestString);
            console.log('Called with context : ' + contextString);
        }
        

        // Make a call to the dispatcher function which will call the proper handler based 
        // on the input intent
        dispatch(event, (response) => callback(null, response));
    } catch (err) {
        callback(err);
    }
};