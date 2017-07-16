import {handler} from '../../lib/bot-fulfillment.js'
import {expect} from 'chai';

describe('Show details intent', () => {
    it ('should list all details of the closest on first call', (done) => {
        const  event = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "A long string",
            "sessionAttributes": {
                "MealFilter": "Breakfast,",
                "Location": "{\"lat\":40.7585913,\"lng\":-73.9846199}",
                "Radius": "96560.6",
                "Address": "165 W 46th St New York",
                "FoodLocationsCount": "1017"
            },
            "bot": {
                "name": "SummerFood",
                "alias": null,
                "version": "$LATEST"
            },
            "outputDialogMode": "Text",
            "currentIntent": {
                "name": "ShowDetails",
                "slots": {},
                "confirmationStatus": "None"
            },
            "inputTranscript": "show me"
        };
        const context = {};

        handler(event, context, (something, results) => {
            // Check the response is a valid format
            expect(response).to.not.equal(null, 'Response must have a value');
            expect(response).to.have.property('dialogAction');
            expect(response.dialogAction.type).to.equal('Close');
            expect(response.dialogAction.fulfillmentState).to.equal('Fulfilled');
            expect(response.dialogAction.message).to.not.equal(null, 'Message was not defined for the response');
            expect(response.dialogAction.message).to.have.property('content');
            
            // Do some checks on the data returned
            
            done();
        });
    });

});