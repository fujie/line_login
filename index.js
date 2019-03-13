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
//const client_id = '1516319320';
const client_id = '1537859534';
//const client_secret = 'fd1a749be0c9d7eb21faf4810cdcfd4a';
const client_secret = 'fdb329ce3924dd50c043fdade69595f3';
const redirect_uri = 'http://localhost:3000/cb';

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30*60*1000
    }
}));

app.get('/', function(req, res) {
    res.send('<html><body><form method="get" action="/login"><button type="submit">login</button></form></body></html>');
});

app.get('/login', function (req, res) {
    req.session.state = random.randomBytes(16).toString('hex');
    req.session.nonce = uuidv4();
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
                    + 'scope=openid%20profile%20email&'
                    + 'state=' + req.session.state + '&'
                    + 'nonce=' + req.session.nonce;
    res.redirect(destination);
})

app.get('/cb_', function (req, res) {
    res.send('<html><body>'
            + '<form method="post" action="' + token_endpoint + '">'
            + '<table><tr><th>grant_type</th><td><input type="text" name="grant_type" value="authorization_code"></td></tr>'
            + '<tr><th>code</th><td><input type="text" name="code" value="' + req.query.code + '"></td></tr>'
            + '<tr><th>redirect_uri</th><td><input type="text" name="redirect_uri" value="' + redirect_uri + '"></td></tr>'
            + '<tr><th>client_id</th><td><input type="text" name="client_id" value="' + client_id + '"></td></tr>'
            + '<tr><th>client_secret</th><td><input type="text" name="client_secret" value="' + client_secret + '"></td></tr>'
            + '</table><button type="submit">Exchange code to token</button><br>'
            + '</form></body></html>'
         );
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
//                    resp.json(body);
                    var jsonBody = JSON.parse(body);
//                    resp.send(jsonBody.access_token);
                    // get nonce from id_token and verify
                    
                    request.get(
                        profile_endpoint,
                        {
                            headers: {
                                'Authorization': 'Bearer ' + jsonBody.access_token
                            }
                        },
                        function(err, res, body){
                            if (!err && res.statusCode == 200) {
                                console.log(body);
                                resp.send(body);
                            } else {
                                console.log("error" + res.statusCode.toString());
                            }
                        }
                    )
                } else {
                    resp.send("error");
                    console.log(body);
                }               
            }
        )
    }
})

app.listen(PORT, () => console.log(`Server running at ${PORT}`));
