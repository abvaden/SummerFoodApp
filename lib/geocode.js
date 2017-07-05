// Script shows an example of how to call the google geocoding api as will be needed
// to do a reverse lookup based on input address
var http = require('http');

const baseURL = 'http://maps.googleapis.com/maps/api/geocode/json?address=';
const sampleAddress = '165 W 46th St New York'


function makeRequest(address, callback) {
    const requestURL = baseURL + address;
    const requestOptions = {
        hostname: requestURL,
        method: 'get'
    };
    http.get(requestURL, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                            `Expected application/json but received ${contentType}`);
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

                if (parsedData.status !== "OK") {
                    throw new Error('Location not found');
                }

                callback(parsedData.results[0].geometry.location);
            } catch (e) {
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
}

makeRequest(sampleAddress, (location) => {
    console.log(location);
    process.exit();
});