import {SelectMealRequest} from './select-meal-fulfillment';
import {ShowLocationRequest} from './show-location-request';
import {GetDirectionsRequest} from './get-directions-request';
import {ShowDetailsRequest} from './show-details-request';
import {ListResultsRequest} from './list-results-request';

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
    } else if (lexRequest.currentIntent.name === 'ShowLocation') {
        var request = new ShowLocationRequest();
        request.Parse(lexRequest);
        return request;
    } else if (lexRequest.currentIntent.name === 'GetDirections') {
        var request = new GetDirectionsRequest();
        request.Parse(lexRequest);
        return request;
    } else if (lexRequest.currentIntent.name === 'ShowDetails') {
        var request = new ShowDetailsRequest();
        request.Parse(lexRequest);
        return request;
    } else if (lexRequest.currentIntent.name === 'ListResults') {
        var request = new ListResultsRequest();
        request.Parse(lexRequest);
        return request;
    }
    else {
        throw new Error('Not implemented yet');
    }
}