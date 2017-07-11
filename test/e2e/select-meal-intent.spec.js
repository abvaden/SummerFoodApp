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
});