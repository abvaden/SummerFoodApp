import {validateLocation} from '../api-calls/reverse-geocode';
import {closestLocation} from '../api-calls/summer-food-service-program-api-call';
import {
    showAnyFromMealFilter, 
    showBreakfastFromMealFilter, 
    showDinnerFromMealFilter,
    showLunchFromMealFilter,
    showSnackFromMealFilter } from './select-meal-fulfillment';
/*
    Example lexRequest to be parsed
    {
        "messageVersion": "1.0",
        "invocationSource": "FulfillmentCodeHook",
        "userId": "8a383098-2a09-40f3-b33c-cd4577df6223:T5J9Z4DSA:U5HH56W7N",
        "sessionAttributes": {
            "MealFilter": "Any"
        },
        "bot": {
            "name": "SummerFood",
            "alias": null,
            "version": "$LATEST"
        },
        "outputDialogMode": "Text",
        "currentIntent": {
            "name": "MealSelect",
            "slots": {
                "all": null,
                "lunch": null,
                "address": "165 W 46th St New York",
                "snack": null,
                "breakfast": null,
                "radius": null,
                "any": "breakfast",
                "dinner": null,
                "meals": "any meal"
            },
            "confirmationStatus": "None"
        },
        "inputTranscript": "165 W 46th St New York"
    }
*/
export class ShowLocationRequest{

    getShowClosest() {
        return this._showClosest;
    }

    getRequest() {
        return this._lexRequest;
    }

    getLocation() {
        return this._location;
    }

    getRadius() {
        return this._radius;
    }


    constructor() {
        this.INTENT_NAME = 'ShowLocation';
        this._showClosest = true;
        this._location = {lat: 0, lng: 0};
        this._radius = 96560.6; // 10 miles
    }

    Parse(lexRequest) {
        this._lexRequest = lexRequest;
        if (lexRequest === null) {
            return;
        }

        const sessionAttributes = lexRequest.sessionAttributes;
        if (sessionAttributes === null) {
            return;
        }

        this._location = JSON.parse(sessionAttributes.Location);
        this._radius = parseFloat(sessionAttributes.Radius);
    }

    validate() {
        let validationErrors = [];

        return validationErrors;
    }

    getClosestLocation(source, locations) {
        return closestLocation(source, locations);
    }
}

export function buildClosestResponseMessage(location, sessionAttributes) {
    if (sessionAttributes == null) {
        throw new Error('Meal filter must be defined');
    }

    if (!location) {
        return 'Oh no! I could not find any places near your search '+
        'that serve the meals you are interested in.';
    }
    const mealFilter = sessionAttributes.MealFilter;

    let shouldShowBreakfastTime = showBreakfastFromMealFilter(mealFilter);
    let shouldShowLunchTime = showLunchFromMealFilter(mealFilter);
    let shouldShowSnackTime = showSnackFromMealFilter(mealFilter);
    let shouldShowDinnerTime = showDinnerFromMealFilter(mealFilter);
    let shouldShowAnyMealTime = showAnyFromMealFilter(mealFilter);

    let breakfastTime = location.attributes.breakfastTime;
    let lunchTime = location.attributes.lunchTime;
    let snackTime = location.attributes.snackTime;
    let dinnerTime = location.attributes.dinnerSupperTime;

    let responseMessage = '';
    
    let mealsToShow = [];
    if (shouldShowBreakfastTime && (breakfastTime != null)) {
        mealsToShow.push({meal: 'Breakfast', time: breakfastTime});
    }
    if (shouldShowLunchTime && (lunchTime != null)) {
        mealsToShow.push({meal: 'Lunch', time: lunchTime});
    }
    if (shouldShowSnackTime && (snackTime != null)) {
        mealsToShow.push({meal: 'Snack', time: snackTime});
    }
    if (shouldShowDinnerTime && (dinnerTime != null)) {
        mealsToShow.push({meal: 'Dinner', time: dinnerTime});
    }

    // If any was selected then we need to get all the values that have times
    // where the specific meal flag is not selected
    if (shouldShowAnyMealTime) {
        if (!shouldShowBreakfastTime && (breakfastTime != null)) {
            mealsToShow.push({meal: 'Breakfast', time: breakfastTime});
        }
        if (!shouldShowLunchTime && (lunchTime != null)) {
            mealsToShow.push({meal: 'Lunch', time: lunchTime});
        }
        if (!shouldShowSnackTime && (snackTime != null)) {
            mealsToShow.push({meal: 'Snack', time: snackTime});
        }
        if (!shouldShowDinnerTime && (dinnerTime != null)) {
            mealsToShow.push({meal: 'Dinner', time: dinnerTime});
        }
    }
    

    // Build the response message string from the meals
    responseMessage += location.attributes.siteName + 
        ' is the closest location I found to you that serves ' + 
        mealFilter
        + 
        '. You can contact them at : (' + 
        location.attributes.contactPhone
        + '). They serve ';

        // Add the meal name and time for each location to the
        // response message
        mealsToShow.forEach((x, idx) => {
            if (idx != mealsToShow.length - 1) {
                responseMessage += x.meal + ' : ' + x.time + ' , ';
            } else{
                responseMessage += x.meal + ' : ' + x.time;
            }
        });

        responseMessage += ' if you would like to learn more try saying ' +
        'give me directions, or show more details';
    return responseMessage;
}