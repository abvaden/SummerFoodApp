
var fetch = require('node-fetch');

const baseURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const sampleAddress = '165 W 46th St New York'


function makeRequest(address) {
    const requestURL = baseURL + address;
    return fetch(requestURL)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if (data.status !== "OK") {
            throw new Error('Location not found');
        }
        return data.results[0].geometry.location;
    })
    .catch(function(e) {
        console.error(e);
    });
}

makeRequest(sampleAddress)
.then(function(response) {
    console.log(response);
    process.exit();
});