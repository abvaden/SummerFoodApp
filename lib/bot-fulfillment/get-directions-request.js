export class GetDirectionsRequest {

    getLexRequest(){
        return this._lexRequest;
    }

    getLocation() {
        return JSON.parse(this._lexRequest.sessionAttributes.Location);
    }
    getRadius() {
        return parseFloat(this._lexRequest.sessionAttributes.Radius);
    }
    constructor() {
        this.INTENT_NAME = 'GetDirections';
    }

    Parse(lexRequest) {
        this._lexRequest = lexRequest;
    }
}