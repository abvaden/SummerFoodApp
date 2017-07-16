import {handler} from '../../lib/bot-fulfillment/fulfillment';
import {expect, should} from 'chai';

describe('Select meal intent', () => {
    it('should ask for a meal slot when no slots have been provided', (done) => {
        const event = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "Some long string",
            "sessionAttributes": null,
            "bot": {
                "name": "SummerFood",
                "alias": null,
                "version": "$UnitTest"
            },
            "outputDialogMode": "Text",
            "currentIntent": {
                "name": "MealSelect",
                "slots": {
                    "all": null,
                    "lunch": null,
                    "snack": null,
                    "breakfast": null,
                    "any": null,
                    "dinner": null,
                    "meals": null
                },
                "confirmationStatus": "None"
            },
            "inputTranscript": "I would like to find places that serve lunch"
        };
        const context = {};
        // This callback is called after 
        const callback = (something, response) => {
            try {
                expect(response).to.not.equal(null, 'Response must have a value');
                expect(response.dialogAction).to.have.property('type');
                expect(response.dialogAction.type).to.equal('ElicitSlot', 'Expected response type of elicit slot');
                expect(response.dialogAction.message).to.have.property('ContentType');
                expect(response.dialogAction.message).to.have.property('Content');
            } finally {
                done();
            }
        };

        // Invoke the lambda function the way lex will
        handler(event, context, callback);
    });

    it('should respond with a number of locations and with the location session attributes set', (done) => {
        const event = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "some-long-string",
            "sessionAttributes": {
                "Radius": "15000",
                "FoodLocationsCount": "631",
                "Address": "165 W 46th St New York",
                "MealFilter": "Lunch,",
                "Location": "{\"lat\":40.7585913,\"lng\":-73.9846199}"
            },
            "bot": {
                "name": "SummerFood",
                "alias": null,
                "version": "$LATEST"
            },
            "outputDialogMode": "Text",
            "currentIntent": {
                "name": "GetDirections",
                "slots": {},
                "confirmationStatus": "None"
            },
            "inputTranscript": "show directions"
        };
        const context = {};

        const callback = (something, response) => {
            try {
                expect(response).to.not.equal(null, 'Response must have a value');
                expect(response).to.have.property('dialogAction');
                expect(response.dialogAction.type).to.equal('Close');
                expect(response.dialogAction.fulfillmentState).to.equal('Fulfilled');
                expect(response.dialogAction.message).to.not.equal(null, 'Message was not defined for the response');
                expect(response.dialogAction.message).to.have.property('content');
                expect(response.dialogAction.message.content.includes('google.com')).to.equal(true, 'message response does not have a link to google maps');
            } finally {
                done();
            }
        };

        handler(event, context, callback);
    });
});