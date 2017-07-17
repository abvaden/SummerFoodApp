// This source code is based on the order flowers blueprint from AWS
'use strict'
var http = require('http');

import {
    SelectMealRequest, 
    showAnyFromMealFilter,
    showBreakfastFromMealFilter,
    showDinnerFromMealFilter,
    showLunchFromMealFilter,
    showSnackFromMealFilter} from './select-meal-fulfillment';
import {ShowLocationRequest, buildClosestResponseMessage} from './show-location-request';
import {elicitSlot, close, delegate} from './helper-functions';
import {generateRequest} from './request-factory';
import {requestSummerFoodLocations, closestLocation, filterByMeals} from '../api-calls/summer-food-service-program-api-call';
import {reverseGeocode, validateLocation} from '../api-calls/reverse-geocode';
import {ShowDetailsRequest} from './show-details-request';
import {ListResultsRequest} from './list-results-request';


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

function handleGetDirections(getDirectionsRequest, callback){
    let lexRequest = getDirectionsRequest.getLexRequest();

    const getFoodLocationsPromise = new Promise((resolve, reject) => {
        let location = getDirectionsRequest.getLocation();
        let radius = getDirectionsRequest.getRadius();
        requestSummerFoodLocations(
            location,
            radius,
            (data) => {
                let filteredLocations = filterByMeals(
                    showBreakfastFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showLunchFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showSnackFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showDinnerFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showAnyFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    data.features
                );
                resolve(filteredLocations);
            }
        )
    }); 

    getFoodLocationsPromise.then((data) => {
        let location = JSON.parse(lexRequest.sessionAttributes.Location);
        let nearestLocation = closestLocation(
            location,
            data
        );
        
        let originAddress = lexRequest.sessionAttributes.Address;
        let destinationAddress = nearestLocation.attributes.address;
        let responseMessage = 'https://www.google.com/maps/dir/' + 
            encodeURIComponent(originAddress) + '/' 
            + encodeURIComponent(destinationAddress);

        let response = close(
            lexRequest.sessionAttributes,
            'Fulfilled',
            { contentType: 'PlainText',  content: responseMessage }
            );
        callback(response);
    });    
}

function handleListResults(listResultsRequest, callback) {
    let lexRequest = listResultsRequest.getLexRequest();

    callback(close(
        lexRequest.sessionAttributes,
        'Fulfilled',
        { contentType: 'PlainText', content: 'Sorry the list results feature has not yet been implemented'}
    ));
}

function handleShowDetailsRequest(showDetailsRequest, callback) {
    let lexRequest = showDetailsRequest.getLexRequest();

    callback(close(
        lexRequest.sessionAttributes,
        'Fulfilled',
        'Sorry the Show details feature has not yet been implemented'
    ));
}

function handleShowLocationRequest(showLocationRequest, callback) {
    let lexRequest = showLocationRequest.getRequest();

    const getFoodLocationsPromise = new Promise((resolve, reject) => {
        let location = showLocationRequest.getLocation();
        let radius = showLocationRequest.getRadius();
        requestSummerFoodLocations(
            location,
            radius,
            (data) => {
                let filteredLocations = filterByMeals(
                    showBreakfastFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showLunchFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showSnackFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showDinnerFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showAnyFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    data.features
                );
                resolve(filteredLocations);
            }
        )
    }); 

    getFoodLocationsPromise.then((data) => {
        let location = JSON.parse(lexRequest.sessionAttributes.Location);
        let nearestLocation = closestLocation(
            location,
            data
        );
        
        let responseMessage = buildClosestResponseMessage(
            nearestLocation, 
            lexRequest.sessionAttributes);
        let response = close(
            lexRequest.sessionAttributes,
            'Fulfilled',
            { contentType: 'PlainText',  content: responseMessage }
            );

        callback(response);
    });
}

function handleShowDetailsRequest(showDetailsRequest, callback) {
    
    // If there are any validation errors with the request deal with those first
    let validationErrors = showDetailsRequest.Validate();
    if (validationErrors.Length > 0) {
        callback(validationErrors[0]);
    }
    
    let lexRequest = showDetailsRequest.getLexRequest();
    
    const getFoodLocationsPromise = new Promise((resolve, reject) => {
        let location = showDetailsRequest.getLocation();
        let radius = showDetailsRequest.getRadius();
        requestSummerFoodLocations(
            location,
            radius,
            (data) => {
                let filteredLocations = filterByMeals(
                    showBreakfastFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showLunchFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showSnackFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showDinnerFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showAnyFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    data.features
                );
                resolve(filteredLocations);
            }
        )
    });
    
    getFoodLocationsPromise.then(locations => {
        let response = showDetailsRequest.getLocationDetails(locations);
        callback(response);
    });
    
    
}

function handleSelectMealRequest(selectMealRequest, callback) {
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
        if (!validateLocation(location)) {
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
        
        lexRequest.sessionAttributes.Location = JSON.stringify(location);
        lexRequest.sessionAttributes.Radius = selectMealRequest.getRadius();
        lexRequest.sessionAttributes.Address = selectMealRequest.getAddress();

        let summerFoodLocationCallback = (foodResults) => {
            // need to set some session attributes here
             var filteredMeals = filterByMeals(
                    showBreakfastFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showLunchFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showSnackFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showDinnerFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    showAnyFromMealFilter(lexRequest.sessionAttributes.MealFilter),
                    foodResults.features);
            lexRequest.sessionAttributes.FoodLocationsCount = filteredMeals.length;

            let response = null;
            if (filteredMeals.length > 0) {
                response = close(
                lexRequest.sessionAttributes,
                'Fulfilled',
                {
                    contentType: 'PlainText', 
                    content: 
                    'Great! I found ' + 
                    filteredMeals.length  + 
                    ' locations near your search , try saying show me the closest or get directions'
                });
            } else {
                response = close(
                lexRequest.sessionAttributes,
                'Fulfilled',
                {
                    contentType: 'PlainText', 
                    content: 
                    'Oh no! I couldn\'t find any places near ' + selectMealRequest.getAddress() + 
                    ' try another location.'
                });
            }
            callback(response);
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
        } else if (request.INTENT_NAME === 'ShowLocation') {
            handleShowLocationRequest(request, callback);
        } else if (request.INTENT_NAME === 'GetDirections') {
            handleGetDirections(request, callback);
        } else if (request.INTENT_NAME === 'ListResults') {
            handleListResults(request, callback);
        } else if (request.INTENT_NAME === 'ShowDetails') {
            handleShowDetailsRequest(request, callback);
        }
        else {
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