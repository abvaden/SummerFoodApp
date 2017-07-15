import {validateLocation} from '../api-calls/reverse-geocode';

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
        this._radius = 15000;
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
        return locations[0];
    }
}