var https = require('https');

var baseAddress = 'https://maps.googleapis.com/maps/api/directions/json?'

function makeRequest(orgin, destination, callback){
}

makeRequest('165 W 46th St New York', '315 E 113th St New York, NY 10029', (data) => {
    console.log(data);
});