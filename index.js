'use strict';
const express = require('express');
const request = require('request');
const uuidv4 = require('uuid/v4');
const session = require('express-session');
const random = require('crypto');
const PORT = process.env.PORT || 3000;
const app = express();
const authorization_endpoint = 'https://access.line.me/oauth2/v2.1/authorize';
const token_endpoint = 'https://api.line.me/oauth2/v2.1/token';
const profile_endpoint = 'https://api.line.me/v2/profile';
const client_id = '1516319320';
const client_secret = 'fd1a749be0c9d7eb21faf4810cdcfd4a';
const redirect_uri = 'http://localhost:3000/cb';

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30*60*1000
    }
}));
app.get('/', function (req, res) {
    req.session.state = random.randomBytes(16).toString('hex');
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
                    + 'state=' + req.session.state + '&'
                    + 'nonce=' + uuidv4();
    res.redirect(destination);
})

app.get('/cb', function (req, resp) {
    // verify state
    if(req.query.state != req.session.state){
        resp.send("state unmatch error");
        console.log('state unmatch!');
    } else {
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
    }
})

app.listen(PORT, () => console.log(`Server running at ${PORT}`));
