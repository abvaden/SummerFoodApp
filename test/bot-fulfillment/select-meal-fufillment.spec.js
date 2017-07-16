import {expect, should} from 'chai';
import {SelectMealRequest} from '../../lib/bot-fulfillment/select-meal-fulfillment.js'

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

        expect(selectMealRequest.getBreakfast()).to.equal(false, 'Failed to set true for breakfast in all request');
        expect(selectMealRequest.getLunch()).to.equal(true, 'Failed to set true for lunch in all request');
        expect(selectMealRequest.getSnack()).to.equal(false, 'Failed to set true for snack in all request');
        expect(selectMealRequest.getDinner()).to.equal(false, 'Failed to set true for dinner in all request');
        expect(selectMealRequest.getAny()).to.equal(false, 'Failed to set false for any in all request');

        const validationErrors = selectMealRequest.ValidateMeals();
        expect(validationErrors).to.be.empty;
    });

    it('Should properly parse a valid all meals request', () => {
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
                    "all": "all",
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

        var selectMealRequest = new SelectMealRequest();
        selectMealRequest.Parse(request);

        expect(selectMealRequest.getBreakfast()).to.equal(true, 'Failed to set true for breakfast in all request');
        expect(selectMealRequest.getLunch()).to.equal(true, 'Failed to set true for lunch in all request');
        expect(selectMealRequest.getSnack()).to.equal(true, 'Failed to set true for snack in all request');
        expect(selectMealRequest.getDinner()).to.equal(true, 'Failed to set true for dinner in all request');
        expect(selectMealRequest.getAny()).to.equal(false, 'Failed to set false for any in all request');

        expect(selectMealRequest.getRequest().currentIntent.slots.meals).to.equal(' breakfast, lunch, snack, dinner');

        const validationErrors = selectMealRequest.ValidateMeals();
        expect(validationErrors).to.be.empty;
    });

    it('Should raise a validation error for an empty request', () => {
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
                    "lunch": null,
                    "snack": null,
                    "breakfast": null,
                    "any": null,
                    "dinner": null
                },
                "confirmationStatus": "None"
            },
            "inputTranscript": "Find places that serve food"
        };

        var selectMealRequest = new SelectMealRequest();
        selectMealRequest.Parse(request);

        const validationErrors = selectMealRequest.ValidateMeals();
        expect(validationErrors).to.be.not.empty;
    });

    it('Should parse a valid location request', () => {
        let lexRequest = {
            "messageVersion": "1.0",
            "invocationSource": "FulfillmentCodeHook",
            "userId": "some-long-string",
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
                    "lunch": null,
                    "address": "12417 cumberland crest drive",
                    "snack": null,
                    "breakfast": null,
                    "radius": null,
                    "any": "breakfast",
                    "dinner": null,
                    "meals": "any meal"
                },
                "confirmationStatus": "None"
            },
            "inputTranscript": "find places near 12417 cumberland crest drive"
        };

        let request = new SelectMealRequest();
        request.Parse(lexRequest);
        let validationErrors = request.ValidateLocation();

        expect(validationErrors).to.be.empty;
        expect(request.getLocationValidated()).to.equal(true);
    });
});