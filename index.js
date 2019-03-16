'use strict';
const express = require('express');
const request = require('request');
const uuidv4 = require('uuid/v4');
const session = require('express-session');
const random = require('crypto');
const bodyParser = require('body-parser');
const jsonwebtoken = require('jsonwebtoken');
const PORT = process.env.PORT || 3000;
const app = express();
const authorization_endpoint = 'https://access.line.me/oauth2/v2.1/authorize';
const token_endpoint = 'https://api.line.me/oauth2/v2.1/token';
const profile_endpoint = 'https://api.line.me/v2/profile';
const client_id = '{your client_id}';
const client_secret = '{your client_secret}';
const redirect_uri = 'http://localhost:3000/cb';

app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30*60*1000
    }
}));
app.use(bodyParser.urlencoded({extended: true}));

//
// Start
//
app.get('/', function(req, res) {
    res.send('<html><body><form method="get" action="/login"><button type="submit">login</button></form></body></html>');
});

//
// login request
//
app.get('/login', function (req, res) {
    req.session.state = random.randomBytes(16).toString('hex');
    req.session.nonce = uuidv4();
    // redirect to authorization endpoint
    // parameters
    //  response_type : code
    //  client_id     : client id
    //  redirect_uri  : callback uri
    //  scope         : openid profile
    //  state         : random value associated with session
    //  nonce         : unique guid associated with session
    let destination = authorization_endpoint + '?'
                    + 'response_type=code&'
                    + 'client_id=' + client_id + '&'
                    + 'redirect_uri=' + redirect_uri + '&'
                    + 'scope=openid%20profile%20email&'
                    + 'state=' + req.session.state + '&'
                    + 'nonce=' + req.session.nonce;
    res.redirect(destination);
})

//
// callback
//
app.get('/cb', function (req, res) {
    // verify state
    if(req.query.state != req.session.state){
        resp.send("state unmatch error");
        console.log('state unmatch!');
    } else {
        // show form
        res.send('<html><body>'
                + '<form method="post" action="/token">'
                + '<table><tr><th>grant_type</th><td><input type="text" name="grant_type" size="100" value="authorization_code"></td></tr>'
                + '<tr><th>code</th><td><input type="text" name="code" size="100" value="' + req.query.code + '"></td></tr>'
                + '<tr><th>redirect_uri</th><td><input type="text" name="redirect_uri" size="100" value="' + redirect_uri + '"></td></tr>'
                + '<tr><th>client_id</th><td><input type="text" name="client_id" size="100" value="' + client_id + '"></td></tr>'
                + '<tr><th>client_secret</th><td><input type="text" name="client_secret" size="100" value="' + client_secret + '"></td></tr>'
                + '</table><button type="submit">Exchange code to token</button><br>'
                + '</form></body></html>'
            );
    }
})

//
// obtain token
//
app.post('/token', function (req, res) {
    // post authorization code and exchange to access_token, id_token
    // parameters
    //  grant_type    : authorization_code
    //  code          : code
    //  redirect_uri  : callback uri
    //  client_id     : client_id
    //  client_secret : client_secret
    request.post(
        token_endpoint,
        {form:
            {
                grant_type: 'authorization_code',
                code: req.body.code,
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret
            }
        },
        function(e, r, body){
            if (!e && r.statusCode == 200) {
                var jsonBody = JSON.parse(body);
                // verify jwt signature
                try {
                    var id_token = jsonwebtoken.verify(jsonBody.id_token, client_secret);
                    // verify nonce in jwt
                    if (id_token.nonce != req.session.nonce){
                        res.send("nonce unmatch error");
                        console.log('nonce unmatch!');            
                    } else {
                        // show form
                        res.send('<html><body>'
                            + '<form method="post" action="/userInfo">'
                            + '<table><tr><th>access_token</th><td><input type="text" name="access_token" size="100" value="' + jsonBody.access_token + '"></td></tr>'
                            + '<tr><th>token_type</th><td><input type="text" name="token_type" size="100" value="' + jsonBody.token_type + '"></td></tr>'
                            + '<tr><th>refresh_token</th><td><input type="text" name="refresh_token" size="100" value="' + jsonBody.refresh_token + '"></td></tr>'
                            + '<tr><th>expires_in</th><td><input type="text" name="expires_in" size="100" value="' + jsonBody.expires_in + '"></td></tr>'
                            + '<tr><th>scope</th><td><input type="text" name="scope" size="100" value="' + jsonBody.scope + '"></td></tr>'
                            + '<tr><th><a href="https://jwt.ms#id_token=' + jsonBody.id_token + '" target="_blank">id_token</a></th><td><input type="text" name="id_token" size="100" value="' + jsonBody.id_token + '"></td></tr>'
                            + '</table><button type="submit">get userInfo</button><br>'
                            + '</form></body></html>'
                        );
                    }
                } catch(err) {
                    res.send("error");
                    console.log(err.toString());
                }
            } else {
                res.send("error");
                console.log(body);
            }               
        }
    )
})

//
// get userinfo
//
app.post('/userInfo', function (req, res) {
    // get user profile from userInfo endpoint
    // headers
    //   Authorization: Bearer access_token
    request.get(
        profile_endpoint,
        {
            headers: {
                'Authorization': 'Bearer ' + req.body.access_token
            }
        },
        function(e, r, body){
            if (!e && r.statusCode == 200) {
                var jsonBody = JSON.parse(body);
                res.send('<html><body>'
                    + '<table border="1"><tr><th>userId</th><td>' + jsonBody.userId + '</td></tr>'
                    + '<tr><th>displayName</th><td>' + jsonBody.displayName + '</td></tr>'
                    + '<tr><th>pictureUrl</th><td>' + jsonBody.pictureUrl + '</td></tr>'
                    + '</table>'
                    + '</body></html>'
                );
            } else {
                res.send("error");
                console.log(body);
            }
        }
    )
})

// start server
app.listen(PORT, () => console.log(`Server running at ${PORT}`));
