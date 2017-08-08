const session = require('express-session');
const express = require("express");
const expressGraphQL = require("express-graphql");
const app = express();
const oauth2 = require('salesforce-oauth2');
const schema = require('./schema.js');
const uuidv1 = require('uuid/v1');

const callbackUrl = process.env.CallbackUrl,
    consumerKey = process.env.ConsumerKey,
    consumerSecret = process.env.ConsumerSecret;

// setting up session
app.use(
    session({ genid: function(req) {
    return uuidv1(); // use UUIDs for session IDs 
    },
    secret: '2DGMUGtrxm', cookie: { maxAge: 60000 }}));

app.get("/", function(request, response) {
    var uri = oauth2.getAuthorizationUrl({
        redirect_uri: callbackUrl,
        client_id: consumerKey,
        scope: 'api'
    });
    return response.redirect(uri);
});

app.get('/oauth/callback', function(request, response) {
    var authorizationCode = request.param('code');
 
    oauth2.authenticate({
        redirect_uri: callbackUrl,
        client_id: consumerKey,
        client_secret: consumerSecret,
        code: authorizationCode
    }, function(error, payload) {
        console.log(payload);     
        request.session.payload = payload; 
        console.log(request.session.payload); 
          
        response.redirect("/graphql");
        /*
 
        The payload should contain the following fields:
        
        id 				A URL, representing the authenticated user,
                        which can be used to access the Identity Service.
        
        issued_at		The time of token issue, represented as the 
                        number of seconds since the Unix epoch
                        (00:00:00 UTC on 1 January 1970).
        
        refresh_token	A long-lived token that may be used to obtain
                        a fresh access token on expiry of the access 
                        token in this response. 
 
        instance_url	Identifies the Salesforce instance to which API
                        calls should be sent.
        
        access_token	The short-lived access token.
 
 
        The signature field will be verified automatically and can be ignored.
 
        At this point, the client application can use the access token to authorize requests 
        against the resource server (the Force.com instance specified by the instance URL) 
        via the REST APIs, providing the access token as an HTTP header in 
        each request:
 
        Authorization: OAuth 00D50000000IZ3Z!AQ0AQDpEDKYsn7ioKug2aSmgCjgrPjG...
        */
    });	
});

app.use('/graphql', expressGraphQL((request) => ({
                schema: schema,
                session: request.session,
                graphiql: true
})));

const ip = process.env.IP ? process.env.IP : "0.0.0.0";
const port = process.env.PORT ? process.env.PORT : 8080;

app.listen(port, ip, () => {
    console.log("Server is running on port %s:%s ...",ip, port);
})