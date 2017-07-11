import elicitSlot from './helper-functions';

/* Example 
    
    The following is an example of the request object coming from 
    Lex for the SelectMeal intent

    {
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
                "dinner": null,
                "meals": null
            },
            "confirmationStatus": "None"
        },
        "inputTranscript": "I would like to find places that serve lunch"
    }
*/

export class SelectMealRequest {

    constructor() {
        this.INTENT_NAME = 'MealSelect';
    }

    getMealsFilterValid() {
        return this._mealsFilterValid;
    }

    getLocationValidated() {
        return this._locationValidated;
    }

    getAddress() {
        return this._address;
    }

    getRadius() {
        return this._radius;
    }

    getBreakfast() {
        return this._breakfast;
    }

    getLunch() {
        return this._lunch;
    }

    getSnack() {
        return this._snack;
    }

    getDinner() {
        return this._dinner;
    }

    getAny() {
        return this._any;
    }

    getRequest() {
        return this._request;
    }

    Parse (request) {
        this._request = request;
        if (!request) {
            return;
        }

        const currentIntent = request.currentIntent;
        if (!currentIntent) {
            return;
        }
        const slots = currentIntent.slots;
        if (!slots) {
            return;
        }

        // Parse the meals filter selection of slots
        const breakfastSlot = slots.breakfast;
        const lunchSlot = slots.lunch;
        const snackSlot = slots.snack;
        const dinnerSlot = slots.dinner;
        const allSlot = slots.all;
        const anySlot = slots.any;

        this._breakfast = breakfastSlot != null;
        this._lunch = lunchSlot != null;
        this._snack = snackSlot != null;
        this._dinner = dinnerSlot != null;
        this._any = anySlot != null;

        if (allSlot != null) {
            this._breakfast = true;
            this._lunch = true;
            this._snack = true;
            this._dinner = true;
            this._any = false;
        }

        this._request.currentIntent.slots.meals = '';
        
        if (this._any) {
            this._request.currentIntent.slots.meals += 'any meal';
        } else if (this._all) {
            this._request.currentIntent.slots.meals += 'all meals';
        } else {
            if (this._breakfast) {
                this._request.currentIntent.slots.meals += ' breakfast';
            }
            if (this._lunch) {
                this._request.currentIntent.slots.meals += ', lunch';
            }
            if (this._snack) {
                this._request.currentIntent.slots.meals += ', snack';
            }
            if (this._dinner) {
                this._request.currentIntent.slots.meals += ', dinner';
            }
        }

        // Parse the location 
        const addressSlot = slots.address;
        const slotRadius = slots.radius;

        if (addressSlot != null) {
            this._address = addressSlot;
        }

        if (slotRadius != null) {
            this._radius = slotRadius;
        } else {
            this._radius = 15000;
        }
    }

    ValidateMeals () {
        let validationErrors = [];

        // If no slots have been defined then elicit the 'any' slot
        if (!this._any && 
            !this._all && 
            !this._dinner && 
            !this._snack && 
            !this._lunch && 
            !this._breakfast) {
                validationErrors.push({ 
                    SlotName: 'any',
                    Message: 'Which meals are you interested in searching for? Try saying any, all, or breakfast'
                });
        }

        this._mealsFilterValid = validationErrors.length == 0;

        return validationErrors;
    }

    ValidateLocation() {
        let validationErrors = [];

        if (!this._address || !this._radius) {
            validationErrors.push({
                SlotName: 'address',
                Message: 'Where would you like to search? Try saying an address.'
            });
        }

        this._locationValidated = validationErrors.length == 0;
        
        return validationErrors;
    }
}
