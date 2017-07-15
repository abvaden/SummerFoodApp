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

    it('should respond with a number of locations with the session attributes set', (done) => {
        const event = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "c6pimm383x6juv5uneutjz2aodtjg55i",
            "sessionAttributes": {
                "MealFilter": "Breakfast,"
            },
            "bot": {
                "name": "SummerFood",
                "alias": null,
                "version": "$LATEST"
            },
            "outputDialogMode": "Text",
            "currentIntent": {
                "name": "MealSelect",
                "slots": {
                    "all": null,
                    "lunch": null,
                    "address": "12417 Cumberland Crest Drive",
                    "snack": null,
                    "breakfast": "breakfast",
                    "radius": null,
                    "any": null,
                    "dinner": null,
                    "meals": " breakfast"
                },
                "confirmationStatus": "None"
            },
            "inputTranscript": "12417 Cumberland Crest Drive"
        };
        const context = {};

        const callback = (something, response) => {
            try {

            } finally {
                done();
            }
        };

        handler(event, context, callback);
    });
});