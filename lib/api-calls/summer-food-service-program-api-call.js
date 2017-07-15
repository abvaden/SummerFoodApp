import {validateLocation} from './reverse-geocode';

var http = require('http');


var stringifyQuery = function(query) {
    var queryString = '';
    for (var key in query) {
        if (key === 'geometry') {
            queryString += key + '=' + encodeURIComponent(JSON.stringify(query['geometry'])) + '&';
        } else {
            queryString += key + '=' + query[key] + '&';
        }
        
    }
    return queryString;
}
var makeQuery = function(location, distance) {
    var deltaLat = distance / 111000.0 / 2.0;
    var deltaLng = distance / Math.cos(location.lat * (Math.PI / 180)) / (111000.0 / 2.0);

    return {
        layerDefs: "dataSource",
        geometry: {
            xmin: location.lng - deltaLng,
            ymin: location.lat - deltaLat,
            xmax: location.lng + deltaLng,
            ymax: location.lat + deltaLat
        },
        geometryType: "esriGeometryEnvelope",
        returnGeometry: true,
        f: "json",
        spatialRel : "esriSpatialRelIntersects",
        inSR: 4326,
        outFields : "*",
        outSR : 4326,
        resultType : "tile"
        };
}

/**
 * 
 * @param {{lat, lng} object for the center of the query} location 
 * @param {Radius of the search in m} distance 
 * @param {callback that will be called with the results of the query} callback 
 */
export function requestSummerFoodLocations(location, distance, callback) {
    
    const query = makeQuery(location, distance);

    const baseURLSummerFoodProgram = 'http://services1.arcgis.com/RLQu0rK7h4kbsBq5/ArcGIS/rest/services/Summer_Meal_Sites_2017/FeatureServer/0/query?';
    var requestURL = baseURLSummerFoodProgram + stringifyQuery(query);
    
    http.get(requestURL, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        }

        if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                callback(parsedData);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

export function closestLocation(location, features) {
    if (!validateLocation(location)) {
        throw new Error('Invalid location');
    }
    

    var minDistIndex = 0;
    var minDist = Number.MAX_VALUE;
    for(let i = 0; i < features.length; i++) {
        let deltaLat = location.lat - features[i].geometry.y;
        let deltaLng = location.lng - features[i].geometry.x;

        let distance = Math.sqrt(
            Math.pow(deltaLat * 111000.0,2) + 
            Math.pow(deltaLng * Math.cos(location.lat * (Math.PI / 180)) / (111000.0 / 2.0)));
        
        if (distance < minDist) {
            minDist = distance;
            minDistIndex = i;
        }
    }

    return features[minDistIndex];
}

export function filterByMeals(
    showBreakfast,
    showLunch,
    showSnack,
    showDinner,
    showAny,
    locations) {
    
    let returnLocations = [];

    locations.forEach(function(element) {
        let meals = element.attributes.mealTypesServed;
        let servesBreakfast = meals.includes('B');
        let servesLunch = meals.includes('L');
        let servesSnack = meals.includes('S');
        let servesDinner = meals.includes('A');

        let shouldAdd = true;
        
        if (showBreakfast && !servesBreakfast) {
            shouldAdd = false;
        }
        if (showLunch && !servesLunch) {
            shouldAdd = false;
        }
        if (showSnack && !servesSnack) {
            shouldAdd = false;
        }
        if (showDinner && !servesDinner) {
            shouldAdd = false;
        }

        if (shouldAdd) {
            returnLocations.push(element);
        }
    }, this);
    
    return returnLocations;
}