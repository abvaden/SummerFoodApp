// This script can be run to push your babel compiled code to AWS

var awsSDK = require('aws-sdk');
var fs = require('fs');
var zip = new require('node-zip')();
var path = require('path');

function base64_encode(file) {
    var data = fs.readFileSync(file);
    return new Buffer(data).toString('base64');
}

awsSDK.config.loadFromPath('./aws-lambda-user-settings.json');
var functionName = require('./aws-lambda-user-settings.json').functionName;

var lambda = new awsSDK.Lambda({
    apiVersion: '2015-03-31'
});

var findFunctionDetails = new Promise((resolve, error) => {
    lambda.listFunctions(function(error, data){
        if (error) {
            console.log(error, error.stack);
        } 

        let functionFound = false;
        let lambdaFunction = null;
        data.Functions.forEach((x) => {
            if (x.FunctionName === functionName) {
                functionFound = true;
                lambdaFunction = x;
            }
        })

        if (functionFound){
            resolve(lambdaFunction);
        } else {
            error('Could not find a lambda function in AWS matching the name provided');
        }
    });
});

findFunctionDetails.then((lambdaFunction) => {
    let data = null;
    try {
        let uncompressedData = fs.readFileSync('./dist/main.js', 'utf8');
        zip.file('index.js', uncompressedData);
        let compressedData = zip.generate({ base64:false, compression:'DEFLATE' });
        if (fs.exists('./dist/main.zip')){
            fs.unlinkSync('./dist/main.zip');
        }
        fs.writeFileSync('./dist/main.zip', compressedData, 'binary');
        data = base64_encode('./dist/main.zip');
        
        let filePath = path.join(__dirname, 'dist', 'main.zip');
        var params = {
            FunctionName: functionName,
            Publish: true,
            ZipFile: data
        };

        lambda.updateFunctionCode(params, (error, data) => {
            if (error) {
                console.log(error, error.stack);
            } 
            else {
                console.log(data);
            }
        });
    } catch (e) {
        throw new Error('Error while encoding the compiled lambda function : ' + e);
    }
}).catch((error) => {
    console.error('Error while lambda function to update');
    process.exit();
});
