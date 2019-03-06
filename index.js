'use strict';
const express = require('express');
const https = require('https');
const request = require('request');
const querystring = require('querystring');
const PORT = process.env.PORT || 3000;
const app = express();
const authorization_endpoint = 'https://access.line.me/oauth2/v2.1/authorize';
const token_endpoint = 'https://api.line.me/oauth2/v2.1/token';
const profile_endpoint = 'https://api.line.me/v2/profile';
const client_id = '1516319320';
const client_secret = 'fd1a749be0c9d7eb21faf4810cdcfd4a';
const redirect_uri = 'http://localhost:3000/cb';

app.get('/', function (req, res) {
    // redirect to authorization endpoint
    // parameters
    //  response_type : code
    //  client_id     : client id
    //  redirect_uri  : callback uri
    //  scope         : openid profile
    //  state         : 
    //  nonce         :
    let destination = authorization_endpoint + '?'
                    + 'response_type=code&'
                    + 'client_id=' + client_id + '&'
                    + 'redirect_uri=' + redirect_uri + '&'
                    + 'scope=openid%20profile&'
                    + 'state=hoge&'
                    + 'nonce=fuga';
    res.redirect(destination);
})

app.get('/cb', function (req, resp) {
    // verify state

    // post authorization code and exchange to access_token, id_token
    request.post(
        token_endpoint,
        {form:
        {
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: redirect_uri,
            client_id: client_id,
            client_secret: client_secret
        }},
        function(err, res, body){
            if (!err && res.statusCode == 200) {
                console.log(body);
                resp.json(body);
            } else {
                resp.send("error");
                console.log(body);
            }               
        }
    )
})

app.listen(PORT, () => console.log(`Server running at ${PORT}`));
