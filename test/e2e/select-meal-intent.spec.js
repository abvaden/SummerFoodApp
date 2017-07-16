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
            expect(response).to.not.equal(null, 'Response must have a value');
            expect(response.dialogAction).to.have.property('type');
            expect(response.dialogAction.type).to.equal('ElicitSlot');
            expect(response.dialogAction.message).to.have.property('contentType');
            expect(response.dialogAction.message).to.have.property('content');
            done();
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
                "MealFilter": "Breakfast,"
            },
            "bot": {
                "name": "SummerFood",
                "alias": null,
                "version": "$UNITTEST"
            },
            "outputDialogMode": "Text",
            "currentIntent": {
                "name": "MealSelect",
                "slots": {
                    "all": null,
                    "lunch": null,
                    "address": "165 W 46th St New York",
                    "snack": null,
                    "breakfast": "breakfast",
                    "radius": null,
                    "any": null,
                    "dinner": null,
                    "meals": " breakfast"
                },
                "confirmationStatus": "None"
            },
            "inputTranscript": "165 W 46th St New York"
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
                expect(response.dialogAction.message.content.includes('Great! I found ')).to.equal(true);
                done();
            } catch (e) {
                done(false);
            }
        };

        handler(event, context, callback);
    });
});