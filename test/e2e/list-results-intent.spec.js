import {handler} from '../../lib/bot-fulfillment/fulfillment';
import {expect} from 'chai';

describe('List Results intent', () => {
    it('should request for the address to be given if not available', (done) => {
        const event = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "Some long string",
            "sessionAttributes": {},
            "bot": {
                "name": "SummerFood",
                "alias": null,
                "version": "$UnitTest"
            },
            "outputDialogMode": "Text",
            "currentIntent": {
                "name": "ListResults",
                "slots": {},
                "confirmationStatus": "None"
            },
            "inputTranscript": "show me all results"
        };
        const context = {};

        handler(event, context, (something, response) => {
            expect(response).to.not.equal(null, 'Response must have a value');
            expect(response.dialogAction).to.have.property('type');
            expect(response.dialogAction.type).to.equal('Close', 'Expected response type of Close');
            expect(response.dialogAction.message).to.have.property('contentType');
            expect(response.dialogAction.message).to.have.property('content');
            done();
        });
    })
});