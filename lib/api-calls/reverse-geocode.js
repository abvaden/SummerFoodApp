var http = require('http');

export function reverseGeocode(address, callback) {
    const requestURL = 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address;
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

export function validateLocation(location) {
    // Check to make sure that either address or geographic has a value and validate the values
    if (!location) {
        return false;
    }

    if ((!location.lat) || (!location.lng)) {
        return false;
    }

    if ((location.lat < -180 || location.lat > 180) || (location.lng < -180 || location.lng > 180)) {
        return false;
    }

    if ((location.lat == 0 && location.lng == 0)) {
        // If the location is 0,0 then a system somewhere failed
        return false;
    }
    return true;
}