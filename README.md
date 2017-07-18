# Jude The Summer Food finder
Jude the summer food finder is a chat bot which can help individuals find places that offer free meals to children during the summer. It is much like the free or reduced lunch program many kids across America participate in during the school year. The bot is currently being hosted on Slack and Facebook, and has been entered into the 2017 AWS Chat bot competition.

# How to work with Jude
Jude works by responding to your request. To start a conversation with Jude try saying something such as, "Find me places that serve summer meals." Then follow the prompts that Jude responds with to learn more.  
Jude is able to search for locations near an address you provide by the types of meals they serve, give you detailed results about the location, and even give you a link with directions to the closest location.


# How Will Jude Evolve
The original intent of Jude was to help people find places that serve free meals who might not have access to the information. Currently, the USDA hosts a service where an individual can text their zip code to a number which will reply with locations near the zip code which participate in the Summer Food Service Program. While this brings the information to many people who might not otherwise have access to this information, we would like to continue to extend access to the Summer Food Service Program by integrating Jude with the Amazon Poly service to bring this information to people who may be illiterate.


# For Jude Developers
To start working on Jude, clone this repo and run "npm install".  

Jude runs as an AWS lambda function hooked into a AWS lex bot service, the  main fulfillment function (entry point for all Lex fulfillments) is in handle function in lib/bot-fulfillment/fulfillment.js.  

Jude delegates the difficult task of reverse geocoding an address provided by a user, to latitude and longitude coordinates to a google api. An example of how to do this and an example of how to query the Summer Food Service Program's database can be found in the lib/examples folder. 

Jude has a select few test to aide in the development and integration with Lex. These test can be run by running the "npm run test" command, or by launching the "Mocha Tests" configuration (for debugging purposes) from VS Code.

Jude is written using some features from the ES2015 specification and higher, to be compatible with Node.js, Jude uses babel and webpack to compile to a single file compatible with Node v6. 

To publish fulfillment code to lambda you can use the npm publish script. This will read the configuration parameters stored in a user secret file aws-lambda-user-settings.json in the root of the project to publish the code to lambda (still a work in progress).  

While the publish feature is being worked on, the source code can be compiled by running npm run prepublish. This will generate a file which can be copied and pasted into the lambda inline editor (/dist/main.js). Similarly running the "npm publish script" will create a /dist/main.zip file which can be uploaded to lambda.

To give Jude a try add to Slack  
<a href="https://slack.com/oauth/authorize?&client_id=188339149894.209789751122&scope=bot,chat:write:bot,team:read,im:history"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
