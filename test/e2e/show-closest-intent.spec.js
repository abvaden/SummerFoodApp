import {handler} from '../../lib/bot-fulfillment/fulfillment';
import {expect, should} from 'chai';

describe('Show meal intent', () => {
    it('should ask for a meal slot when no slots have been provided', (done) => {
        const event = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "some-long-string",
            "sessionAttributes": {
                "Radius": "15000",
                "FoodLocationsCount": "630",
                "Address": "165 W 46th St New York",
                "MealFilter": "Breakfast",
                "Location": "{\"lat\":40.758879,\"lng\":-73.985195}"
            },
            "bot": {
                "name": "SummerFood",
                "alias": null,
                "version": "$LATEST"
            },
            "outputDialogMode": "Text",
            "currentIntent": {
                "name": "ShowLocation",
                "slots": {},
                "confirmationStatus": "None"
            },
            "inputTranscript": "show me the closest"
        };
        const context = {};
        // This callback is called after 
        const callback = (something, response) => {
            try {
                expect(response).to.not.equal(null, 'Response must have a value');
                expect(response.dialogAction).to.have.property('type');
                expect(response.dialogAction.type).to.equal('Close', 'Expected response type of Close');
                expect(response.dialogAction.message).to.have.property('contentType');
                expect(response.dialogAction.message).to.have.property('content');
            } finally {
                done();
            }
        };

        // Invoke the lambda function the way lex will
        handler(event, context, callback);
    });
});