import {SelectMealRequest} from './select-meal-fulfillment';
import {ShowLocationRequest} from './show-location-request';

/**
//  * Returns an appropriate custom request object based on the data provided by 
 * Lex
 * @param {Request as given by lex bot} lexRequest 
 */
export function generateRequest(lexRequest) {
    if (lexRequest == null) {
        throw new Error('Error can not create a request from a null lexRequest');
    }

    if (lexRequest.currentIntent === null) {
        throw new Error('Error current intent must be specified on a lexRequest to create a request');
    }

    if (lexRequest.currentIntent.name === "MealSelect") {
        var request = new SelectMealRequest();
        request.Parse(lexRequest);
        return request;
    } else if (lexRequest.currentIntent.name = 'ShowLocation') {
        var request = new ShowLocationRequest();
        request.Parse(lexRequest);
        return request;
    }
    else {
        throw new Error('Not implemented yet');
    }
}