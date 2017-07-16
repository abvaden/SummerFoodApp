import {expect, should} from 'chai';
import {buildClosestResponseMessage} from '../../lib/bot-fulfillment/show-location-request.js'

describe('Show location response message', () => {
    it('Should build a message based on the meal filter', () => {
        const location = {
            "attributes": {
                "OBJECTID": 74276, 
                "siteName": "PS 102 Jacques Cartier", 
                "siteStatus": "Open", 
                "address": "315 E 113th St New York, NY 10029", 
                "address2": null, 
                "city_1": "New York", 
                "state": "NY", 
                "zip": 10029, 
                "sitePhone": 7187074371, 
                "ext": null, 
                "contactFirstName": "Bart", 
                "contactLastName": "Pelucco", 
                "contactPhone": 7187074371, 
                "sponsoringOrganization": "NYC Chancellor's Office", 
                "startDate": 1499212800000, 
                "endDate": 1502755200000, 
                "daysofOperation": "MTWTHF", 
                "hoursOpen": null, 
                "breakfastTime": "08:00AM-08:30AM", 
                "lunchTime": "11:00AM-12:00PM", 
                "snackTime": null, 
                "dinnerSupperTime": null, 
                "mealTypesServed": "BL", 
                "cycleNumber": 11, 
                "RecordStatus": "N", 
                "FNSID": 96294, 
                "Created_ts": 1499904000000
            },
            "geometry": {
                "x": -73.93862275699968, "y": 40.794856155000446
            }
        };
        const sessionAttributes = {
            "Radius": "15000",
            "FoodLocationsCount": "650",
            "Address": "165 W 46th St New York",
            "MealFilter": "Lunch,",
            "Location": "{\"lat\":40.758879,\"lng\":-73.985195}"
        };
        
        const responseMessage = buildClosestResponseMessage(location, sessionAttributes);

        expect(responseMessage).to.not.equal(null);
        expect(responseMessage.includes('11:00AM-12:00PM')).to.equal(true);
        expect(responseMessage.includes('7187074371')).to.equal(true);
        expect(responseMessage.includes('PS 102 Jacques Cartier')).to.equal(true);
    });
});
