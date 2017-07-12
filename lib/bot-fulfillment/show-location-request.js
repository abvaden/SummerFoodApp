import {validateLocation} from '../api-calls/reverse-geocode';

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