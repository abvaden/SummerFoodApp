import {handler} from '../../lib/bot-fulfillment/fulfillment';
import {expect} from 'chai';

describe('Show details intent', () => {
    it ('should list all details of the closest on first call', (done) => {
        const  event = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "some long string",
            "sessionAttributes": {
                "Radius": "10000.0",
                "FoodLocationsCount": "1189",
                "Address": "165 W 46th St New York",
                "MealFilter": "Lunch,",
                "Location": "{\"lat\":40.7585913,\"lng\":-73.9846199}"
            },
            "bot": {
                "name": "SummerFood",
                "alias": null,
                "version": "$UnitTest"
            },
            "outputDialogMode": "Text",
            "currentIntent": {
                "name": "ShowDetails",
                "slots": {},
                "confirmationStatus": "None"
            },
            "inputTranscript": "show me more details"
        };
        const context = {};

        handler(event, context, (something, response) => {
            // Check the response is a valid format
            expect(response).to.not.equal(null, 'Response must have a value');
            expect(response).to.have.property('dialogAction');
            expect(response.dialogAction.type).to.equal('Close');
            expect(response.dialogAction.fulfillmentState).to.equal('Fulfilled');
            
            // Do some checks on the data returned
            done();
        });
    });

});