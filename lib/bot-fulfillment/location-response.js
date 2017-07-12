export class LocationResponse {
    
    getAddress() {
        return this._address;
    }
    
    getContactPhoneNumber() {
        return this._contactPhoneNumber;
    }

    getServerResponse() {
        return this._serverResponse;
    }
    constructor() {

    }

    parseFromServerResponse(serverResponse) {
        this._serverResponse = serverResponse;
    }
}