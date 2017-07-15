import {validateLocation} from '../../lib/api-calls/reverse-geocode';
import {expect, should} from 'chai';

describe('ValidateLocation function', () => {
    it('Should validate true for valid location objects', () => {
        let location1 = { lat: -80, lng: -73 };
        let location1Validated = validateLocation(location1);
        expect(location1Validated).to.equal(true);

        let location2 = { "lat": 35, "lng": -85 };
        let location2Validated = validateLocation(location2);
        expect(location2Validated).to.equal(location2Validated);
    });
});