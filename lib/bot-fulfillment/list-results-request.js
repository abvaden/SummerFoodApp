import {distanceToLocation} from '../api-calls/summer-food-service-program-api-call';

export class ListResultsRequest {

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
        this.INTENT_NAME = 'ListResults';
        this._lexRequest = null;
    }

    Parse(lexRequest) {
        this._lexRequest = lexRequest;
    }

    getNextLocations(locations) {
        if (!this._lexRequest.sessionAttributes.lastDisplayedIndex) {
            lastDisplayedIndex = 0;
        }

        let sourceLocation = this.getLocation();
        locations.sort((l1, l2) => {
            let distanceToL1 = distanceToLocation(
                sourceLocation,
                {lat: l1.geometry.x, lng: l1.geometry.y});
            let distanceToL2 = distanceToLocation(
                sourceLocation,
                {lat: l2.geometry.x, lng: l2.geometry.y});
            
            if (distanceToL1 == distanceToL2) {
                return 0;
            } else if (distanceToL2 < distanceToL1) {
                return -1;
            } else {
                return 1;
            }
        });

        let numberOfLocationsToReturn = 10;

        if (lastDisplayedIndex >= locations.length) {
            lastDisplayedIndex = 0;
        }

        let locationsToReturn = [];
        for (let i = lastDisplayedIndex; (i < lastDisplayedIndex + 10) && (i < locations.length); i++) {
            locationsToReturn.push(locations[i]);
        }

        return locationsToReturn;
    }
}