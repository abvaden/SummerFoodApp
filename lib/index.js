// Lets use the fetch api because it's really cool and I like it
var fetch = require('node-fetch');

var baseURL = 'https://services1.arcgis.com/RLQu0rK7h4kbsBq5/ArcGIS/rest/services/Summer_Meal_Sites_2017/FeatureServer/0/query?';

var sampleQuery = {
    "layerDefs": "dataSource",
    "geometry": {
        "xmin": -20037508.342788905,
        "ymin": 0.000004861503839492798,
        "xmax": -0.000004861503839492798,
        "ymax": 20037508.342788905
    },
    "geometryType": "esriGeometryEnvelope",
    "returnGeometry": true,
    "f": "json",
    "spatialRel" : "esriSpatialRelIntersects",
    "inSR": 102100,
    "outFields" : "*",
    "outSR" : 102100,
    "resultType" : "tile"
};

var makeRequest = function(url, query) {
    var requestURL = url + stringifyQuery(query);
    fetch(requestURL, {method: 'get' })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        console.log(data);
    })
    .catch(function(e) {
        console.error(e);
    });
    return null;
}
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

makeRequest(baseURL, sampleQuery);