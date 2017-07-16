import {close,elicitSlot,delegate} from './helper-functions';

export class ShowDetailsRequest{
    
    getLexRequest() {
        return this._lexRequest;
    }

    getLocation() {
        return JSON.Parse(this._lexRequest.sessionAttributes.Location);
    }

    getRadius() {
        return parseFloat(this._lexRequest.sessionAttributes.Radius);
    }

    constructor() {
        this._lexRequest = null;
    }

    Parse(lexRequest) {
        this._lexRequest = lexRequest;
    }

    Validate() {
        if (this._lexRequest === null) {
            throw new Error('Parse must be called before validate');
        }

        if ((this._lexRequest.sessionAttributes.Location) ||
            (this._lexRequest.sessionAttributes.Location === null)) {
            return close(
                this._lexRequest.sessionAttributes,
                'Fulfilled',
                {
                    contentType: 'PlainText',
                    content: 'I\'m sorry I must first know where you want to search, ' +
                    'try saying find places near an address.'
                });
        }
    }

    getLocationDetails(locations) {

    }
}

export function buildDetailsResponseMessage(location) {
    return 'Sorry this feature has not yet been implemented';
}