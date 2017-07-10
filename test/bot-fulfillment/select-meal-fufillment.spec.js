var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

import SelectMealRequest from '../../lib/bot-fulfillment/select-meal-fulfillment.js'

describe('SelectMealRequest', () => {
    it('Should properly parse a valid request', () => {
        const request = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "Some long string",
            "sessionAttributes": null,
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
                    "lunch": "lunch",
                    "snack": null,
                    "breakfast": null,
                    "any": null,
                    "dinner": null
                },
                "confirmationStatus": "None"
            },
            "inputTranscript": "I would like to find places that serve lunch"
        };

        var selectMealRequest = new SelectMealRequest();
        selectMealRequest.Parse(request);

        expect(selectMealRequest.getLunch()).to.equal(true, 'Failed to parse lunch');
    });
});