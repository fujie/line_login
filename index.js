'use strict';
const express = require('express');
const https = require('https');
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

app.get('/cb', function (req, res) {
    // verify state

    // post authorization code and exchange to access_token, id_token
    let postData = querystring.stringify({
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: redirect_uri,
        client_id: client_id,
        client_secret: client_secret
      });
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };      
    let httpreq = https.request(token_endpoint, options, function (httpres) {
        let result = '';
        httpres.on('data', function (chunk) {
          result += chunk;
        });
        httpres.on('end', function () {
          console.log(result);
          res.json(result);
        });
        httpres.on('error', function (err) {
          console.log(err);
        })
      });
       
      // req error
      httpreq.on('error', function (err) {
        console.log(err);
      });
       
      //send request witht the postData form
      httpreq.write(postData);
      httpreq.end();
})


//サーバー起動
app.listen(PORT, () => console.log(`Server running at ${PORT}`));
