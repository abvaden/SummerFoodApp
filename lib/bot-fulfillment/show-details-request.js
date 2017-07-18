import {close,elicitSlot,delegate} from './helper-functions';
import {closestLocation} from '../api-calls/summer-food-service-program-api-call';

export class ShowDetailsRequest{
    
    getLexRequest() {
        return this._lexRequest;
    }

    getLocation() {
        return JSON.parse(this._lexRequest.sessionAttributes.Location);
    }

    getRadius() {
        return parseFloat(this._lexRequest.sessionAttributes.Radius);
    }

    constructor() {
        this._lexRequest = null;
        this.INTENT_NAME = 'ShowDetails';
    }

    Parse(lexRequest) {
        this._lexRequest = lexRequest;
    }

    Validate() {
        if (this._lexRequest === null) {
            throw new Error('Parse must be called before validate');
        }

        let validationErrors = [];
        if ((!this._lexRequest.sessionAttributes.Location) ||
            (this._lexRequest.sessionAttributes.Location === null)) {
            validationErrors.push(close(
                this._lexRequest.sessionAttributes,
                'Fulfilled',
                {
                    contentType: 'PlainText',
                    content: 'I\'m sorry I must first know where you want to search, ' +
                    'try saying find places near an address.'
                }));
        }

        return validationErrors;
    }

    getLocationDetails(locations) {

        if (true) {
            let sourceLocation = JSON.parse(this._lexRequest.sessionAttributes.Location);
            let nearestLocation = closestLocation(sourceLocation, locations);

            var responseText = 
            'You can contact ' + nearestLocation.attributes.contactFirstName + ' '
            + nearestLocation.attributes.contactLastName + ' at '  + nearestLocation.attributes.siteName 
            + ' at ' + nearestLocation.attributes.contactPhone + '. \n' + 
            nearestLocation.attributes.siteName + ' is located at ' + nearestLocation.attributes.address +
            ', ' + nearestLocation.attributes.city_1 + ', ' + nearestLocation.attributes.zip + '.\n' +
            'They serve ' + 
            nearestLocation.attributes.mealTypesServed
            .replace('B', 'Breakfast ')
            .replace('L', 'Lunch ')
            .replace('A', 'Snack ')
            .replace('D', 'Dinner')
             + ' on ' + nearestLocation.attributes.daysofOperation + '.\n';

            if (nearestLocation.attributes.breakfastTime != null) {
                responseText += 'They serve breakfast at ' + nearestLocation.attributes.breakfastTime + '.\n';
            }
            if (nearestLocation.attributes.lunchTime != null) {
                responseText += 'They serve lunch at ' + nearestLocation.attributes.lunchTime + '.\n';
            }
            if (nearestLocation.attributes.snackTime != null) {
                responseText += 'They serve snack at ' + nearestLocation.attributes.snackTime + '.\n';
            }
            if (nearestLocation.attributes.dinnerTime != null) {
                responseText += 'They serve dinner at ' + nearestLocation.attributes.dinnerTime + '.\n';
            }
        }
        var response = close(
            this._lexRequest.sessionAttributes,
            'Fulfilled', 
            {
                contentType: 'PlainText',
                content: responseText
            });
        return response;
    }
}

export function buildDetailsResponseMessage(location) {
    return 'Sorry this feature has not yet been implemented';
}